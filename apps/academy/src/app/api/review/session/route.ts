// 리뷰 모드 세션 — 비밀번호 확인 후 서명 쿠키 발급 / 상태 확인 / 종료
import { createSessionRoute } from "@bayada/review/server";

const route = createSessionRoute("academy");
export const dynamic = "force-dynamic";
export const GET = route.GET;
export const POST = route.POST;
export const DELETE = route.DELETE;
