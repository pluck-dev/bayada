"use server";

import { revalidatePath } from "next/cache";
import { ServiceError } from "@bayada/services";
import { paymentService } from "../services";
import { ActionError, runAction } from "../session";

function done(id: string) {
  revalidatePath("/[locale]/(dashboard)", "layout");
  revalidatePath(`/[locale]/(dashboard)/orders/${id}`, "page");
}

/** 서비스 에러(검증·토스 응답)는 그대로 운영자에게 보여 준다 */
async function service<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ServiceError) throw new ActionError(e.message);
    throw e;
  }
}

/** 환불 처리 — 토스 결제 취소 API(전액·부분) → 주문 갱신, 전액이면 수강권 회수. 감사 로그는 서비스가 남긴다 */
export async function refundOrder(orderId: string, amount: number, reason: string) {
  return runAction("commerce", async (user) => {
    const r = await service(() => paymentService.refund({ orderId, amount: Math.round(Number(amount)), reason, actorId: user.id }));
    done(orderId);
    return {
      message: r.full
        ? `전액 환불했습니다. 수강권 회수: 수강 ${r.revoked?.enrollmentsDeleted ?? 0}건 · 구독 ${r.revoked?.subscriptionsCanceled ?? 0}건`
        : `${amount.toLocaleString()}원을 부분 환불했습니다. (누적 ${r.refundTotal.toLocaleString()}원)`,
    };
  });
}

export async function rejectRefundRequest(orderId: string, memo: string) {
  return runAction("commerce", async (user) => {
    await service(() => paymentService.rejectRefundRequest(orderId, user.id, memo));
    done(orderId);
    return { message: "환불 요청을 반려했습니다." };
  });
}
