import { courseService } from "@/lib/services";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const course = await courseService.getBySlug(slug);
    return successResponse(course);
  } catch (error) {
    return errorResponse(error);
  }
}
