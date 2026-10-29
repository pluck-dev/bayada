// 바야다 인증 — 학습자 화면용 라벨·상태 계산 (서버·클라이언트 공용, prisma 미사용)
import type { CredentialAppStatus } from "@bayada/db";

/** 학습자에게 보이는 신청 상태 (내부 단계 '평가 완료'는 '심사 중'으로 묶는다 — 합격 여부는 운영자 승인 때 알린다) */
export const APP_STATUS_LABEL: Record<CredentialAppStatus, string> = {
  SUBMITTED: "접수 완료",
  EVALUATING: "평가 진행 중",
  EVALUATED: "최종 심사 중",
  APPROVED: "발급 완료",
  REJECTED: "반려",
};

export const APP_STATUS_CLASS: Record<CredentialAppStatus, string> = {
  SUBMITTED: "bg-line-soft text-ink-soft",
  EVALUATING: "bg-line-soft text-ink-soft",
  EVALUATED: "bg-line-soft text-ink-soft",
  APPROVED: "bg-success-soft text-success",
  REJECTED: "bg-brand-soft text-brand",
};

export const OPEN_APP_STATUSES: CredentialAppStatus[] = ["SUBMITTED", "EVALUATING", "EVALUATED"];

export type CredentialState = "valid" | "expiring" | "expired" | "revoked";

/** 인증 상태: 취소 > 만료 > 갱신 알림 기간 > 유효 */
export function credentialState(
  c: { expiresAt: Date | null; revokedAt: Date | null },
  renewalNoticeDays: number,
  now = new Date(),
): CredentialState {
  if (c.revokedAt) return "revoked";
  if (c.expiresAt && c.expiresAt <= now) return "expired";
  if (c.expiresAt && c.expiresAt.getTime() - now.getTime() <= renewalNoticeDays * 86400_000) return "expiring";
  return "valid";
}

/** 만료까지 남은 날 (D-day 표기용, 올림) */
export function daysLeft(d: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400_000));
}

export function validityText(months: number | null): string {
  if (months == null) return "영구 (만료 없음)";
  if (months % 12 === 0) return `발급일로부터 ${months / 12}년`;
  return `발급일로부터 ${months}개월`;
}
