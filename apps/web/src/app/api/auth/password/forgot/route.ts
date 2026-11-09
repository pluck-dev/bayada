import { NextResponse } from "next/server";
import { requestPasswordReset } from "@bayada/services/account";
import { appUrl, localeOr } from "@/lib/app-url";

// 비밀번호 재설정 메일 요청 (아카데미와 같은 토큰·규칙). 가입 여부와 상관없이 항상 같은 응답(계정 존재 노출 방지).
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
    console.error("[web password-reset] 요청 처리 실패", error);
  }
  return NextResponse.json({ ok: true });
}
