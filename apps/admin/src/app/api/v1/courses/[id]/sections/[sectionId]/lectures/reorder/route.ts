import { lectureService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { sectionId } = await params;
    const { lectureIds } = await request.json();
    const lectures = await lectureService.reorder(sectionId, lectureIds);
    return successResponse(lectures);
  } catch (error) {
    return errorResponse(error);
  }
}
