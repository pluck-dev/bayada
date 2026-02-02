import { enrollmentService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { courseId } = await params;
    const isEnrolled = await enrollmentService.isEnrolled(session.user.id, courseId);
    return successResponse({ enrolled: isEnrolled });
  } catch (error) {
    return errorResponse(error);
  }
}
