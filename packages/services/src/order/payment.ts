// B2C 결제(토스페이먼츠) — 강의 단건 구매 · 아카데미 패스 구독 · 환불
import { Prisma, type PrismaClient, type ProductType } from "@bayada/db";
import { generateOrderNo } from "@bayada/shared/constants";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { cancelTossPayment, confirmTossPayment, describeTossMethod, TossError, type TossPayment } from "./toss";

/**
 * Enrollment 에는 출처 컬럼이 없어 감사 로그(target=Enrollment:<id>)로 표시한다.
 * 가장 최근 기록이 PASS 면 "패스로 수강" → 유효한 패스가 있을 때만 들을 수 있다.
 * PURCHASE 는 패스로 듣던 강의를 따로 구매해 소유로 바뀐 경우.
 */
export const ENROLLMENT_SOURCE = { PASS: "enrollment.pass", PURCHASE: "enrollment.purchase" } as const;

export const ORDER_AUDIT = {
  PAID: "order.paid",
  REFUND_REQUEST: "order.refund_request",
  REFUND_REJECT: "order.refund_reject",
  REFUND: "order.refund",
} as const;

export type CheckoutTarget = { courseId: string } | { planId: string };

/** order.paid 감사 로그 detail — 전액 환불 때 무엇을 되돌릴지 여기서 읽는다 */
interface PaidDetail {
  amount: number;
  method: string | null;
  receiptUrl: string | null;
  enrollmentsCreated: string[];
  enrollmentsConverted: string[];
  subscriptionId: string | null;
}

export type RefundRequestState =
  | { status: "none" }
  | { status: "requested"; reason: string; at: Date }
  | { status: "rejected"; reason: string; memo: string; at: Date }
  | { status: "refunded"; reason: string | null; at: Date };

type Tx = Prisma.TransactionClient;

export class PaymentService {
  constructor(private prisma: PrismaClient) {}

  // ─── 패스 ───

  /** 현재 유효한 구독 (시작 ≤ 지금 < 종료, 해지 안 됨) */
  activeSubscriptions(userId: string, now = new Date()) {
    return this.prisma.subscription.findMany({
      where: { userId, canceledAt: null, startsAt: { lte: now }, endsAt: { gt: now } },
      include: { plan: { select: { id: true, name: true, includes: true } } },
      orderBy: { endsAt: "desc" },
    });
  }

  /** 유효한 패스가 이 상품 유형을 포함하는지 */
  async passCovers(userId: string, productType: ProductType): Promise<boolean> {
    const subs = await this.activeSubscriptions(userId);
    return subs.some((s) => s.plan.includes.includes(productType));
  }

  /** 패스로 수강 중인 Enrollment 인지 (가장 최근 출처 기록 기준) */
  async isPassEnrollment(enrollmentId: string, db: PrismaClient | Tx = this.prisma): Promise<boolean> {
    const last = await db.auditLog.findFirst({
      where: { target: `Enrollment:${enrollmentId}`, action: { in: [ENROLLMENT_SOURCE.PASS, ENROLLMENT_SOURCE.PURCHASE] } },
      orderBy: { at: "desc" },
      select: { action: true },
    });
    return last?.action === ENROLLMENT_SOURCE.PASS;
  }

  /**
   * 수강 권한이 살아 있는 Enrollment 인지.
   * 직접 신청·구매·기관 배정·이전 데이터 → 항상 유효. 패스로 수강 → 무료 강의이거나 유효한 패스가 그 유형을 포함할 때만.
   */
  async enrollmentActive(
    enrollmentId: string,
    userId: string,
    course: { price: number; productType: ProductType },
  ): Promise<boolean> {
    if (course.price === 0) return true;
    if (!(await this.isPassEnrollment(enrollmentId))) return true;
    return this.passCovers(userId, course.productType);
  }

  /** 패스로 수강 신청 (호출 전에 노출 규칙·유료 여부를 확인할 것) */
  async enrollWithPass(userId: string, course: { id: string; productType: ProductType }) {
    const subs = await this.activeSubscriptions(userId);
    const sub = subs.find((s) => s.plan.includes.includes(course.productType));
    if (!sub) throw new ValidationError("이 프로그램을 포함하는 이용 중인 아카데미 패스가 없습니다");
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } });
      if (existing) return existing; // 이미 수강(구매·패스) 중 — 출처는 바꾸지 않는다
      const enrollment = await tx.enrollment.create({ data: { userId, courseId: course.id } });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: ENROLLMENT_SOURCE.PASS,
          target: `Enrollment:${enrollment.id}`,
          detail: { courseId: course.id, subscriptionId: sub.id, plan: sub.plan.name },
        },
      });
      return enrollment;
    });
  }

  // ─── 주문 생성 ───

  /**
   * 결제 대기 주문 생성. 금액은 서버에서 DB 가격으로만 계산한다.
   * 강의 노출 규칙(사내 전용 등)은 앱에서 먼저 확인하고 부른다.
   * 같은 상품의 이전 결제 대기 주문은 취소한다 (늦게 승인이 와도 상태 불일치로 거절·자동 취소됨).
   */
  async createCheckoutOrder(userId: string, target: CheckoutTarget) {
    let item: { courseId?: string; passPlanId?: string; price: number };
    let orderName: string;
    if ("courseId" in target) {
      const course = await this.prisma.course.findUnique({
        where: { id: target.courseId },
        select: { id: true, title: true, price: true, status: true, productType: true },
      });
      if (!course || course.status !== "PUBLISHED") throw new NotFoundError("프로그램");
      if (course.price <= 0) throw new ValidationError("무료 프로그램은 결제 없이 수강신청할 수 있습니다");
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
        select: { id: true },
      });
      if (enrollment && (await this.enrollmentActive(enrollment.id, userId, course))) {
        throw new ConflictError("이미 수강 중인 프로그램입니다");
      }
      item = { courseId: course.id, price: course.price };
      orderName = course.title;
    } else {
      const plan = await this.prisma.passPlan.findUnique({ where: { id: target.planId } });
      if (!plan || !plan.active) throw new NotFoundError("패스 요금제");
      if (plan.price <= 0) throw new ValidationError("결제할 수 없는 요금제입니다");
      item = { passPlanId: plan.id, price: plan.price };
      orderName = `아카데미 패스 · ${plan.name}`;
    }

    await this.prisma.order.updateMany({
      where: {
        userId,
        status: "PENDING",
        type: "B2C",
        items: { some: item.courseId ? { courseId: item.courseId } : { passPlanId: item.passPlanId } },
      },
      data: { status: "CANCELLED" },
    });

    // 주문번호 = 토스 orderId (영문·숫자·-_ 6~64자). 동시 생성으로 번호가 겹치면 다시 센다
    for (let attempt = 0; attempt < 5; attempt++) {
      const today = new Date();
      const prefix = generateOrderNo(today, 0).slice(0, -3);
      const last = await this.prisma.order.findFirst({
        where: { orderNo: { startsWith: prefix } },
        orderBy: { orderNo: "desc" },
        select: { orderNo: true },
      });
      const seq = (last ? Number(last.orderNo.slice(prefix.length)) || 0 : 0) + 1 + attempt;
      try {
        const order = await this.prisma.order.create({
          data: {
            orderNo: generateOrderNo(today, seq),
            userId,
            type: "B2C",
            status: "PENDING",
            totalAmount: item.price,
            items: { create: [{ ...item, quantity: 1 }] },
          },
        });
        return { order, orderName: orderName.slice(0, 100) };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    throw new ConflictError("주문번호를 만들지 못했습니다. 다시 시도해 주세요");
  }

  // ─── 결제 승인 ───

  /**
   * successUrl 처리: 금액 검증 → 토스 승인 → 주문 확정 + 수강권 지급 (한 트랜잭션).
   * 같은 결제로 다시 들어오면 지급 없이 결과만 돌려준다 (멱등).
   */
  async confirmPayment(input: { userId: string; orderNo: string; paymentKey: string; amount: number }) {
    const order = await this.prisma.order.findUnique({ where: { orderNo: input.orderNo } });
    if (!order || order.userId !== input.userId) throw new NotFoundError("주문");
    if (order.status === "CONFIRMED" || order.status === "REFUNDED") {
      if (order.paymentKey === input.paymentKey) return { orderId: order.id, already: true };
      throw new ConflictError("이미 결제가 끝난 주문입니다");
    }
    if (order.status !== "PENDING") throw new ConflictError("취소된 주문입니다. 다시 결제해 주세요");
    if (!Number.isInteger(input.amount) || input.amount !== order.totalAmount) {
      // 승인 전이라 돈은 빠져나가지 않았다 (승인 API 를 부르지 않으면 인증 건은 만료된다)
      throw new ValidationError("결제 금액이 주문 금액과 일치하지 않습니다");
    }

    const payment = await confirmTossPayment(input.paymentKey, order.orderNo, order.totalAmount);
    if (payment.orderId !== order.orderNo || payment.totalAmount !== order.totalAmount || payment.status !== "DONE") {
      await this.safeCancel(input.paymentKey, "결제 정보 불일치", `mismatch-${order.orderNo}`);
      throw new ValidationError("결제 정보가 주문과 일치하지 않아 결제를 취소했습니다");
    }

    const granted = await this.prisma.$transaction(async (tx) => {
      const flipped = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: {
          status: "CONFIRMED",
          paymentKey: payment.paymentKey,
          paymentMethod: describeTossMethod(payment),
          paidAt: payment.approvedAt ? new Date(payment.approvedAt) : new Date(),
        },
      });
      if (flipped.count === 0) return false;
      await this.grant(tx, order.id, order.userId, payment);
      return true;
    });

    if (!granted) {
      const now = await this.prisma.order.findUnique({ where: { id: order.id } });
      if (now?.paymentKey === payment.paymentKey) return { orderId: order.id, already: true };
      // 그 사이 주문이 취소됐다 — 승인된 돈은 돌려준다
      await this.safeCancel(payment.paymentKey, "취소된 주문의 결제", `orphan-${order.orderNo}`);
      throw new ConflictError("주문이 취소된 상태라 결제를 자동 취소했습니다. 다시 결제해 주세요");
    }
    return { orderId: order.id, already: false };
  }

  private async safeCancel(paymentKey: string, reason: string, key: string) {
    try {
      await cancelTossPayment(paymentKey, reason, undefined, key);
    } catch (e) {
      console.error("[payment] 자동 취소 실패", paymentKey, e instanceof TossError ? e.code : e);
    }
  }

  private async grant(tx: Tx, orderId: string, userId: string, payment: TossPayment) {
    const items = await tx.orderItem.findMany({
      where: { orderId },
      include: { passPlan: { select: { id: true, durationDays: true } } },
    });
    const detail: PaidDetail = {
      amount: payment.totalAmount,
      method: describeTossMethod(payment),
      receiptUrl: payment.receipt?.url ?? null,
      enrollmentsCreated: [],
      enrollmentsConverted: [],
      subscriptionId: null,
    };
    for (const item of items) {
      if (item.courseId) {
        const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: item.courseId } } });
        if (!existing) {
          const e = await tx.enrollment.create({ data: { userId, courseId: item.courseId } });
          detail.enrollmentsCreated.push(e.id);
        } else if (await this.isPassEnrollment(existing.id, tx)) {
          // 패스로 듣던 강의를 구매 → 소유로 전환 (진도 유지)
          await tx.auditLog.create({
            data: { actorId: userId, action: ENROLLMENT_SOURCE.PURCHASE, target: `Enrollment:${existing.id}`, detail: { orderId } },
          });
          detail.enrollmentsConverted.push(existing.id);
        }
      } else if (item.passPlan) {
        // 갱신: 같은 요금제가 아직 남아 있으면 그 종료일부터 이어 붙인다
        const now = new Date();
        const current = await tx.subscription.findFirst({
          where: { userId, planId: item.passPlan.id, canceledAt: null, endsAt: { gt: now } },
          orderBy: { endsAt: "desc" },
          select: { endsAt: true },
        });
        const base = current ? current.endsAt : now;
        const sub = await tx.subscription.create({
          data: {
            userId,
            planId: item.passPlan.id,
            orderId,
            startsAt: now,
            endsAt: new Date(base.getTime() + item.passPlan.durationDays * 86_400_000),
          },
        });
        detail.subscriptionId = sub.id;
      }
    }
    await tx.auditLog.create({
      data: { actorId: userId, action: ORDER_AUDIT.PAID, target: `Order:${orderId}`, detail: detail as unknown as Prisma.InputJsonValue },
    });
  }

  // ─── 환불 ───

  /** 주문의 환불 요청 상태 (감사 로그로 판정) */
  async refundState(orderId: string): Promise<RefundRequestState> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        target: `Order:${orderId}`,
        action: { in: [ORDER_AUDIT.REFUND_REQUEST, ORDER_AUDIT.REFUND_REJECT, ORDER_AUDIT.REFUND] },
      },
      orderBy: { at: "desc" },
      take: 10,
    });
    const last = logs[0];
    if (!last) return { status: "none" };
    const d = (last.detail ?? {}) as Record<string, unknown>;
    const lastRequest = logs.find((l) => l.action === ORDER_AUDIT.REFUND_REQUEST);
    const reqReason = String(((lastRequest?.detail ?? {}) as Record<string, unknown>).reason ?? "");
    if (last.action === ORDER_AUDIT.REFUND_REQUEST) return { status: "requested", reason: String(d.reason ?? ""), at: last.at };
    if (last.action === ORDER_AUDIT.REFUND_REJECT) return { status: "rejected", reason: reqReason, memo: String(d.memo ?? ""), at: last.at };
    return { status: "refunded", reason: lastRequest ? reqReason : null, at: last.at };
  }

  /** 학습자 환불 요청 — 실제 환불은 운영자가 어드민에서 처리 */
  async requestRefund(orderId: string, userId: string, reasonRaw: string) {
    const reason = reasonRaw.trim().slice(0, 500);
    if (reason.length < 2) throw new ValidationError("환불 사유를 입력해 주세요");
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new NotFoundError("주문");
    if (order.status !== "CONFIRMED" || !order.paymentKey) throw new ConflictError("환불을 요청할 수 있는 주문이 아닙니다");
    if ((order.refundAmount ?? 0) >= order.totalAmount) throw new ConflictError("이미 환불된 주문입니다");
    const state = await this.refundState(orderId);
    if (state.status === "requested") throw new ConflictError("이미 환불 요청을 접수했습니다. 처리 결과를 기다려 주세요");
    await this.prisma.auditLog.create({
      data: { actorId: userId, action: ORDER_AUDIT.REFUND_REQUEST, target: `Order:${orderId}`, detail: { reason } },
    });
  }

  /** 운영자 환불 요청 반려 */
  async rejectRefundRequest(orderId: string, actorId: string, memoRaw: string) {
    const memo = memoRaw.trim().slice(0, 500);
    if (memo.length < 2) throw new ValidationError("반려 사유를 입력해 주세요");
    const state = await this.refundState(orderId);
    if (state.status !== "requested") throw new ConflictError("처리할 환불 요청이 없습니다");
    await this.prisma.auditLog.create({
      data: { actorId, action: ORDER_AUDIT.REFUND_REJECT, target: `Order:${orderId}`, detail: { memo } },
    });
  }

  /**
   * 운영자 환불: 토스 결제 취소(전액·부분) → 주문 갱신.
   * 전액 환불이 되면 이 주문으로 생긴 수강권을 회수한다 (주문이 만든 Enrollment 삭제 · 구독 해지).
   */
  async refund(input: { orderId: string; amount: number; reason: string; actorId: string }) {
    const reason = input.reason.trim().slice(0, 200);
    if (reason.length < 2) throw new ValidationError("환불 사유를 입력해 주세요");
    const order = await this.prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new NotFoundError("주문");
    if (order.status !== "CONFIRMED" || !order.paymentKey) throw new ConflictError("결제 완료 상태의 주문만 환불할 수 있습니다");
    const prev = order.refundAmount ?? 0;
    const remaining = order.totalAmount - prev;
    if (!Number.isInteger(input.amount) || input.amount <= 0 || input.amount > remaining) {
      throw new ValidationError(`환불 금액은 1원 이상 ${remaining.toLocaleString()}원 이하여야 합니다`);
    }

    const payment = await cancelTossPayment(
      order.paymentKey,
      reason,
      input.amount,
      `cancel-${order.id}-${prev}-${input.amount}`,
    );

    const total = prev + input.amount;
    const full = total >= order.totalAmount;
    const revoked = await this.prisma.$transaction(async (tx) => {
      // 동시에 두 번 처리되지 않게 이전 환불액을 조건으로 건다
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: "CONFIRMED", refundAmount: order.refundAmount },
        data: {
          refundAmount: total,
          refundReason: reason,
          refundedAt: new Date(),
          ...(full ? { status: "REFUNDED" as const } : {}),
        },
      });
      if (updated.count === 0) throw new ConflictError("다른 환불 처리와 겹쳤습니다. 새로고침 후 확인해 주세요");
      const r = full ? await this.revokeAccess(tx, order.id, order.userId, input.actorId) : null;
      await tx.auditLog.create({
        data: {
          actorId: input.actorId,
          action: ORDER_AUDIT.REFUND,
          target: `Order:${order.id}`,
          detail: {
            amount: input.amount,
            refundTotal: total,
            full,
            reason,
            tossStatus: payment.status,
            balanceAmount: payment.balanceAmount,
            ...(r ? { revoked: r } : {}),
          },
        },
      });
      return r;
    });
    return { full, refundTotal: total, revoked };
  }

  private async revokeAccess(tx: Tx, orderId: string, userId: string, actorId: string) {
    const paid = await tx.auditLog.findFirst({
      where: { target: `Order:${orderId}`, action: ORDER_AUDIT.PAID },
      orderBy: { at: "desc" },
      select: { detail: true },
    });
    const d = (paid?.detail ?? {}) as Partial<PaidDetail>;
    const created = d.enrollmentsCreated ?? [];
    const converted = d.enrollmentsConverted ?? [];
    const deleted = created.length
      ? (await tx.enrollment.deleteMany({ where: { id: { in: created }, userId } })).count
      : 0;
    // 구매로 소유가 됐던 패스 수강은 다시 패스 수강으로 되돌린다
    for (const id of converted) {
      await tx.auditLog.create({
        data: { actorId, action: ENROLLMENT_SOURCE.PASS, target: `Enrollment:${id}`, detail: { orderId, reason: "refund" } },
      });
    }
    const subs = await tx.subscription.updateMany({
      where: { orderId, canceledAt: null },
      data: { canceledAt: new Date() },
    });
    return { enrollmentsDeleted: deleted, enrollmentsReverted: converted.length, subscriptionsCanceled: subs.count };
  }
}
