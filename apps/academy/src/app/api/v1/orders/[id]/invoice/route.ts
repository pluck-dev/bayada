import { NextResponse } from "next/server";
import { invoiceService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { id } = await params;
    const invoice = await invoiceService.getByOrder(id);
    // 본인 주문의 청구서만
    if (invoice.order.userId !== session.user.id) {
      return NextResponse.json({ error: "청구서를 찾을 수 없습니다" }, { status: 404 });
    }
    return successResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}
