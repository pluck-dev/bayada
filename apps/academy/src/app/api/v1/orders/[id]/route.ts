import { NextResponse } from "next/server";
import { orderService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { id } = await params;
    const order = await orderService.getById(id);
    // 본인 주문만 (다른 사람 주문은 존재를 숨긴다)
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
    }
    return successResponse(order);
  } catch (error) {
    return errorResponse(error);
  }
}
