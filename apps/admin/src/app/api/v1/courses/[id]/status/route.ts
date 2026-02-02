import { courseService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { status } = await request.json();
    const course = await courseService.updateStatus(id, status);
    return successResponse(course);
  } catch (error) {
    return errorResponse(error);
  }
}
