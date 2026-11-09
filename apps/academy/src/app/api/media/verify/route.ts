import { NextResponse } from "next/server";
import { verifyMediaUri } from "@/lib/media-sign";

/**
 * 미디어 서버(Caddy forward_auth) 전용: 영상 요청의 서명 확인.
 * Caddy 는 원래 요청의 경로+쿼리를 X-Forwarded-Uri 로 넘기고, 2xx 면 파일을 보내고 그 외에는 이 응답을 그대로 돌려준다.
 */
export async function GET(request: Request) {
  const result = verifyMediaUri(request.headers.get("x-forwarded-uri"));
  if (result === "ok") return new NextResponse(null, { status: 204 });
  // 비밀값이 없으면 영상을 전부 막는다(설정 누락을 조용히 넘기지 않도록)
  const status = result === "disabled" ? 503 : result === "expired" ? 410 : 403;
  return new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });
}
