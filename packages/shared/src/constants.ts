// ─── 역할별 라벨 ───
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "관리자",
  STUDENT: "수강생",
  ORG_ADMIN: "기관 관리자",
} as const;

// ─── 강의 상태 라벨 ───
export const COURSE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "공개",
  ARCHIVED: "보관",
} as const;

// ─── 주문 상태 라벨 ───
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
} as const;

// ─── 주문 타입 라벨 ───
export const ORDER_TYPE_LABELS: Record<string, string> = {
  B2C: "개인",
  B2B: "기관",
} as const;

// ─── 페이지네이션 ───
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

// ─── 주문번호/청구서번호 접두사 ───
export const ORDER_NO_PREFIX = "ORD";
export const INVOICE_NO_PREFIX = "INV";

// ─── 가격 포맷 ───
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

// ─── 시간 포맷 (초 → 시:분:초) ───
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── 주문번호 생성 ───
export function generateOrderNo(date: Date, seq: number): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `${ORDER_NO_PREFIX}-${d}-${String(seq).padStart(3, "0")}`;
}

// ─── 청구서번호 생성 ───
export function generateInvoiceNo(date: Date, seq: number): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `${INVOICE_NO_PREFIX}-${d}-${String(seq).padStart(3, "0")}`;
}
