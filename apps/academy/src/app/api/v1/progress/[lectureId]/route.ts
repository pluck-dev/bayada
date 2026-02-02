import { enrollmentService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { lectureId } = await params;
    const body = await request.json();
    const progress = await enrollmentService.updateProgress(session.user.id, lectureId, body);
    return successResponse(progress);
  } catch (error) {
    return errorResponse(error);
  }
}
