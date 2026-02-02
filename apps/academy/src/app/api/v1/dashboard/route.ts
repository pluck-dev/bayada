import { dashboardService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const dashboard = await dashboardService.getStudentDashboard(session.user.id);
    return successResponse(dashboard);
  } catch (error) {
    return errorResponse(error);
  }
}
