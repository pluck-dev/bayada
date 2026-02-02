import { dashboardService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const students = await dashboardService.getRecentStudents();
    return successResponse(students);
  } catch (error) {
    return errorResponse(error);
  }
}
