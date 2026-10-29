import { NextResponse } from "next/server";
import { isValidLocale } from "@bayada/shared/i18n";
import { requestPasswordReset } from "@bayada/services/account";

// 메일 링크 기준 주소 — 요청 Host 헤더가 아니라 설정값(로컬 3200, 운영 ADMIN_URL→NEXTAUTH_URL)으로 만든다(Host 조작 방지)
const ADMIN_URL = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3200").replace(/\/+$/, "");

// 어드민 비밀번호 재설정 메일 요청. 가입 여부와 상관없이 항상 같은 응답(계정 존재 노출 방지).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; locale?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식을 확인하세요." }, { status: 400 });
  }
  const locale = typeof body.locale === "string" && isValidLocale(body.locale) ? body.locale : "ko";
  try {
    await requestPasswordReset({
      email,
      admin: true,
      buildUrl: (token) => `${ADMIN_URL}/${locale}/auth/reset-password?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    console.error("[admin password-reset] 요청 처리 실패", error);
  }
  return NextResponse.json({ ok: true });
}
