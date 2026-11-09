// 리뷰 피드백 댓글 API — 로직은 @bayada/review/server
import { createReplyRoute } from "@bayada/review/server";

const route = createReplyRoute("academy");
export const dynamic = "force-dynamic";
export const GET = route.GET;
export const POST = route.POST;
export const DELETE = route.DELETE;
