// 결제 내역 화면 공통 (서버·클라이언트 공용 — prisma import 금지)

export type OrderBadge = { label: string; tone: "success" | "brand" | "muted" | "amber" };

/** 주문 상태 + 환불 요청 상태 → 표시 배지 */
export function orderBadge(
  o: { status: string; totalAmount: number; refundAmount: number | null },
  refundRequested: boolean
): OrderBadge {
  if (o.status === "REFUNDED") return { label: "환불 완료", tone: "muted" };
  if (o.status === "CANCELLED") return { label: "취소", tone: "muted" };
  if (o.status === "PENDING") return { label: "결제 대기", tone: "amber" };
  if (refundRequested) return { label: "환불 요청 중", tone: "amber" };
  if (o.refundAmount && o.refundAmount > 0) return { label: "부분 환불", tone: "brand" };
  return { label: "결제 완료", tone: "success" };
}

export const BADGE_CLASS: Record<OrderBadge["tone"], string> = {
  success: "bg-success-soft text-success",
  brand: "bg-brand-soft text-brand",
  muted: "bg-line-soft text-muted",
  amber: "bg-amber-50 text-amber-800",
};

const KST_DATETIME = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTimeKst(d: Date | string): string {
  return KST_DATETIME.format(typeof d === "string" ? new Date(d) : d);
}
