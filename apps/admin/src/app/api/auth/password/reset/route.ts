import { NextResponse } from "next/server";
import { resetPassword } from "@bayada/services/account";

// 메일 링크 토큰으로 새 비밀번호 설정 → 이전 세션 전부 무효(passwordChangedAt, 아카데미 세션 포함)
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const result = await resetPassword(
    typeof body.token === "string" ? body.token : "",
    typeof body.password === "string" ? body.password : ""
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
