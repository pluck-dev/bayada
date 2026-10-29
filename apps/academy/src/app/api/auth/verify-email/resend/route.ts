import { NextResponse } from "next/server";
import { lastVerificationSentAt, sendVerificationEmail } from "@bayada/services/account";
import { getViewer } from "@/lib/viewer";
import { appUrl, localeOr } from "@/lib/app-url";

const RESEND_COOLDOWN_MS = 60 * 1000;

// 이메일 인증 메일 다시 보내기 (로그인 사용자 본인). 1분에 한 번.
export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  const locale = localeOr(body.locale);
  const last = await lastVerificationSentAt(viewer.id);
  if (last && Date.now() - last.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: "방금 보냈어요. 1분 뒤에 다시 시도해 주세요." }, { status: 429 });
  }
  try {
    const sent = await sendVerificationEmail(viewer.id, (token) =>
      appUrl(`/${locale}/auth/verify-email?token=${encodeURIComponent(token)}`)
    );
    if (!sent) return NextResponse.json({ error: "이미 인증된 이메일이에요." }, { status: 409 });
  } catch (error) {
    console.error("[verify-email] 발송 실패", error);
    return NextResponse.json({ error: "메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, email: viewer.email });
}
