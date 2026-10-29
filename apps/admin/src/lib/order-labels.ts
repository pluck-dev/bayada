// 주문 표기 — 클라이언트·서버 공용 (prisma import 금지)
import type { OrderStatus, OrderType } from "@bayada/db";
import type { Tone } from "./labels";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "결제 대기",
  CONFIRMED: "결제 완료",
  REFUNDED: "환불",
  CANCELLED: "취소",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  PENDING: "amber",
  CONFIRMED: "green",
  REFUNDED: "slate",
  CANCELLED: "zinc",
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = { B2C: "개인", B2B: "기관" };

/** 주문 항목 요약 — "강의명 외 2건" */
export function orderTitle(items: { course: { title: string } | null; passPlan: { name: string } | null }[]): string {
  const first = items[0];
  if (!first) return "-";
  const t = first.course?.title ?? (first.passPlan ? `아카데미 패스 · ${first.passPlan.name}` : "-");
  return items.length > 1 ? `${t} 외 ${items.length - 1}건` : t;
}
