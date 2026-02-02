import { organizationService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = parseSearchParams(request.url);
    const result = await organizationService.list({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
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
    const org = await organizationService.create(body);
    return successResponse(org, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
