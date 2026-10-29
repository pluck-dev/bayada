import type { JobRole } from "@bayada/db";

// 회원가입 입력 규칙. 화면과 API 가 같이 쓴다.
export const PASSWORD_RULE = "8자 이상, 영문과 숫자를 모두 포함";

export function passwordError(password: string): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 해요.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "비밀번호에 영문과 숫자를 모두 넣어 주세요.";
  return null;
}

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
