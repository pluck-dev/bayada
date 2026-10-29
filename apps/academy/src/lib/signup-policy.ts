import type { JobRole } from "@bayada/db";

// 회원가입 입력 규칙. 화면과 API 가 같이 쓴다. 비밀번호 규칙은 어드민 비밀번호 재설정과 공용이라 shared 에 둔다.
export { PASSWORD_RULE, passwordError } from "@bayada/shared/password-policy";

// 피그마 IA: 가입 시 대상 직군을 받아 맞춤 추천에 쓴다
export const JOB_ROLE_OPTIONS: { value: JobRole; label: string }[] = [
  { value: "CAREGIVER", label: "요양보호사·간병인" },
  { value: "NURSE_AIDE", label: "간호조무사" },
  { value: "RN", label: "간호사(RN)" },
  { value: "PT", label: "방문운동사" },
  { value: "MANAGER", label: "센터 관리자" },
  { value: "OTHER", label: "기타·학생" },
];

export const isJobRole = (v: unknown): v is JobRole => JOB_ROLE_OPTIONS.some((o) => o.value === v);
