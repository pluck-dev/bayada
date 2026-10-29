import { prisma, type OrderStatus, type Prisma } from "@bayada/db";
import { ORDER_AUDIT } from "@bayada/services";

export const ORDER_PAGE_SIZE = 30;

/** 처리 대기 중인 환불 요청이 있는 주문 id (주문별 마지막 환불 관련 기록이 "요청") */
export async function pendingRefundOrderIds(): Promise<string[]> {
  const logs = await prisma.auditLog.findMany({
    where: { action: { in: [ORDER_AUDIT.REFUND_REQUEST, ORDER_AUDIT.REFUND_REJECT, ORDER_AUDIT.REFUND] } },
    orderBy: { at: "asc" },
    select: { target: true, action: true },
  });
  const last = new Map(logs.map((l) => [l.target, l.action]));
  return [...last].filter(([, a]) => a === ORDER_AUDIT.REFUND_REQUEST).map(([t]) => t.slice("Order:".length));
}

export type OrderFilter = OrderStatus | "REFUND_REQUESTED" | undefined;

export async function listOrders(params: { status?: string; q?: string; page: number }) {
  const status: OrderFilter =
    params.status === "PENDING" || params.status === "CONFIRMED" || params.status === "REFUNDED" || params.status === "CANCELLED" || params.status === "REFUND_REQUESTED"
      ? params.status
      : undefined;
  const q = params.q?.trim();
  const requested = await pendingRefundOrderIds();
  const search: Prisma.OrderWhereInput = q
    ? {
        OR: [
          { orderNo: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
          { user: { email: { contains: q.toLowerCase() } } },
          { paymentKey: q },
        ],
      }
    : {};
  const where: Prisma.OrderWhereInput = {
    ...search,
    ...(status === "REFUND_REQUESTED" ? { id: { in: requested } } : status ? { status } : {}),
  };
  const [total, rows, grouped] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * ORDER_PAGE_SIZE,
      take: ORDER_PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        items: { include: { course: { select: { title: true } }, passPlan: { select: { name: true } } } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], where: search, _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Partial<Record<OrderStatus, number>>;
  return {
    rows,
    total,
    page: params.page,
    pages: Math.max(1, Math.ceil(total / ORDER_PAGE_SIZE)),
    status,
    counts,
    requested: new Set(requested),
  };
}
