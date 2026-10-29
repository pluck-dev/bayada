// 비밀번호 규칙 — 가입·비밀번호 재설정(아카데미·어드민) 화면과 API 가 같이 쓴다. 클라이언트에서도 import 하므로 서버 전용 코드 금지.
export const PASSWORD_RULE = "8자 이상, 영문과 숫자를 모두 포함";

export function passwordError(password: string): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 해요.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "비밀번호에 영문과 숫자를 모두 넣어 주세요.";
  return null;
}
