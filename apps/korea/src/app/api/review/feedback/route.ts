import { createFeedbackRoute } from "@bayada/review/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const { GET, POST, PUT, PATCH, DELETE } = createFeedbackRoute("web");
