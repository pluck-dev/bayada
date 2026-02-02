import { courseService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";
import type { CourseStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = parseSearchParams(request.url);
    const result = await courseService.list({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
      status: params.status as CourseStatus | undefined,
      categoryId: params.categoryId,
      search: params.search,
    });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const course = await courseService.create(body);
    return successResponse(course, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
