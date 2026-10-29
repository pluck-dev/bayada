// 바야다 인증 — 상태 라벨·합격 판정 (서버·클라이언트 공용 순수 모듈)
import type { CredentialAppStatus } from "@bayada/db";
import type { Tone } from "./labels";
import type { CredentialProgramInput } from "./actions/credentials";

export const CREDENTIAL_APP_STATUSES: CredentialAppStatus[] = ["SUBMITTED", "EVALUATING", "EVALUATED", "APPROVED", "REJECTED"];

export const CREDENTIAL_APP_STATUS_LABEL: Record<CredentialAppStatus, string> = {
  SUBMITTED: "평가 대기",
  EVALUATING: "평가 중",
  EVALUATED: "평가 완료",
  APPROVED: "발급 완료",
  REJECTED: "반려",
};

export const CREDENTIAL_APP_STATUS_TONE: Record<CredentialAppStatus, Tone> = {
  SUBMITTED: "zinc",
  EVALUATING: "violet",
  EVALUATED: "amber",
  APPROVED: "green",
  REJECTED: "slate",
};

/** 아직 결론이 나지 않은 신청 (학습자는 이 상태의 신청이 있으면 다시 신청할 수 없다) */
export const OPEN_APP_STATUSES: CredentialAppStatus[] = ["SUBMITTED", "EVALUATING", "EVALUATED"];

export interface Thresholds {
  examPassingScore: number;
  practicalRequired: boolean;
  practicalPassingScore: number;
}

/**
 * 점수 → 합격 판정. 점수가 모자라 판정할 수 없으면 null.
 * 판정은 저장하지 않고 매번 현재 과정 기준으로 계산한다 (스키마에 결과 필드가 없음 — 평가 완료 시점의 기준은 감사 로그에 남긴다).
 */
export function judge(
  t: Thresholds,
  examScore: number | null | undefined,
  practicalScore: number | null | undefined,
): boolean | null {
  if (examScore == null) return null;
  if (t.practicalRequired && practicalScore == null) return null;
  return examScore >= t.examPassingScore && (!t.practicalRequired || (practicalScore ?? 0) >= t.practicalPassingScore);
}

export function validityLabel(months: number | null): string {
  if (months == null) return "영구";
  if (months % 12 === 0) return `${months / 12}년`;
  return `${months}개월`;
}

/** 남은 일수 — 올림 (아카데미 학습자 화면의 "만료 N일 전"과 같은 값이 나오게) */
export function daysUntil(d: Date, now = new Date()): number {
  return Math.ceil((d.getTime() - now.getTime()) / 86400_000);
}

/** 새 인증 과정 폼 기본값 — 스키마 기본값과 맞춘다 ("use client" 파일에 두면 서버에서 클라이언트 참조가 되어 못 쓴다) */
export const EMPTY_CREDENTIAL_PROGRAM: CredentialProgramInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  requiredCourseIds: [],
  examPassingScore: 80,
  practicalRequired: true,
  practicalPassingScore: 80,
  validityMonths: "",
  renewalNoticeDays: 30,
  criteria: "",
  active: false,
};
