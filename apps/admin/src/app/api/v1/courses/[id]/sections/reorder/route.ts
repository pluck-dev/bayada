import { sectionService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { sectionIds } = await request.json();
    const sections = await sectionService.reorder(id, sectionIds);
    return successResponse(sections);
  } catch (error) {
    return errorResponse(error);
  }
}
