import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// 어드민이 홈페이지 콘텐츠(블로그·FAQ·후기·히어로·사이트 정보)를 저장한 뒤 부른다.
// 헤더 x-revalidate-secret = WEB_REVALIDATE_SECRET. 콘텐츠가 작아 경로를 고르지 않고 전체를 다시 만든다.
export async function POST(request: Request) {
  const secret = process.env.WEB_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "WEB_REVALIDATE_SECRET 미설정" }, { status: 503 });
  const given = Buffer.from(request.headers.get("x-revalidate-secret") ?? "");
  const want = Buffer.from(secret);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
