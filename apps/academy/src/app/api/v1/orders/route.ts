import { orderService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

// 주문 생성은 결제(/api/v1/checkout)로만 한다 — 결제 없이 주문을 만들던 장바구니 POST 는 제거
export async function GET() {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const orders = await orderService.listByUser(session.user.id);
    return successResponse(orders);
  } catch (error) {
    return errorResponse(error);
  }
}
