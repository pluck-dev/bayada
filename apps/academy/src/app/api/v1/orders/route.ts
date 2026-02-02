import { orderService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

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

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { courseIds } = await request.json();
    const order = await orderService.createB2COrder(session.user.id, courseIds);
    return successResponse(order, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
