import { sectionService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { sectionId } = await params;
    const body = await request.json();
    const section = await sectionService.update(sectionId, body);
    return successResponse(section);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { sectionId } = await params;
    await sectionService.delete(sectionId);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
