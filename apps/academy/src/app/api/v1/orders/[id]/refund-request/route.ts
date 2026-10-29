import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { paymentService } from "@/lib/services";
import { getViewer } from "@/lib/viewer";

/** 환불 요청 접수 (감사 로그 order.refund_request) — 실제 환불은 어드민에서 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { reason?: unknown };
    await paymentService.requestRefund(id, viewer.id, typeof body.reason === "string" ? body.reason : "");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
