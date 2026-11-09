import { NextResponse } from "next/server";
import { resetPassword } from "@bayada/services/account";

// 메일 링크 토큰으로 새 비밀번호 설정. 성공하면 홈페이지·아카데미의 이전 세션이 모두 무효(passwordChangedAt).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await resetPassword(token, password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, email: result.email });
}
