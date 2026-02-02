import { lectureService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lectureId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { lectureId } = await params;
    const body = await request.json();
    const lecture = await lectureService.update(lectureId, body);
    return successResponse(lecture);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lectureId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { lectureId } = await params;
    await lectureService.delete(lectureId);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
