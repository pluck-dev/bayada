import { NextResponse } from "next/server";
import { requestPasswordReset } from "@bayada/services/account";
import { appUrl, localeOr } from "@/lib/app-url";

const SAME_RESPONSE = { ok: true };

// 비밀번호 재설정 메일 요청. 가입 여부와 상관없이 항상 같은 응답(계정 존재 노출 방지).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; locale?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식을 확인해 주세요." }, { status: 400 });
  }
  const locale = localeOr(body.locale);
  try {
    await requestPasswordReset({
      email,
      buildUrl: (token) => appUrl(`/${locale}/auth/reset-password?token=${encodeURIComponent(token)}`),
    });
  } catch (error) {
    // 메일 서버 장애 등 — 응답을 바꾸면 계정 존재가 드러나므로 로그만 남긴다
    console.error("[password-reset] 요청 처리 실패", error);
  }
  return NextResponse.json(SAME_RESPONSE);
}
