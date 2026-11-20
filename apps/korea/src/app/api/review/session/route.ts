import { createSessionRoute } from "@bayada/review/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const { GET, POST, DELETE } = createSessionRoute("web");
