import { dashboardService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const stats = await dashboardService.getAdminStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
