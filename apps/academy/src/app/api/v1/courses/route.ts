import { courseService } from "@/lib/services";
import { successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const params = parseSearchParams(request.url);
    const result = await courseService.listPublished({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
      categoryId: params.categoryId,
      search: params.search,
      sort: params.sort,
    });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
