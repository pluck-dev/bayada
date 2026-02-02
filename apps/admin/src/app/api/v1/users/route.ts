import { userService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";
import type { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = parseSearchParams(request.url);
    const result = await userService.list({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
      role: params.role as Role | undefined,
      search: params.search,
    });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
