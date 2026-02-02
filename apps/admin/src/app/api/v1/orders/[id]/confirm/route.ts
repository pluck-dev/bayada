import { orderService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const order = await orderService.confirm(id);
    return successResponse(order);
  } catch (error) {
    return errorResponse(error);
  }
}
