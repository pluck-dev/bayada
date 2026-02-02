import { enrollmentService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const enrollments = await enrollmentService.getByUser(session.user.id);
    return successResponse(enrollments);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { courseId } = await request.json();
    const enrollment = await enrollmentService.enroll(session.user.id, courseId);
    return successResponse(enrollment, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
