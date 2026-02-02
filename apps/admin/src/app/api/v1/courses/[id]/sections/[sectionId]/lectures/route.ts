import { lectureService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { sectionId } = await params;
    const body = await request.json();
    const lecture = await lectureService.create(sectionId, body);
    return successResponse(lecture, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
