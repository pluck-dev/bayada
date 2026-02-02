import { categoryService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const category = await categoryService.update(id, body);
    return successResponse(category);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await categoryService.delete(id);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
