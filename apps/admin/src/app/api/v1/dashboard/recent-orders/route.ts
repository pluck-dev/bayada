import { dashboardService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const orders = await dashboardService.getRecentOrders();
    return successResponse(orders);
  } catch (error) {
    return errorResponse(error);
  }
}
