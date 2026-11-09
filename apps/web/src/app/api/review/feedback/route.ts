// 리뷰 피드백 API — 로직은 @bayada/review/server (사이트 키로 범위를 나눈다)
import { createFeedbackRoute } from "@bayada/review/server";

const route = createFeedbackRoute("web");
export const dynamic = "force-dynamic";
export const GET = route.GET;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
