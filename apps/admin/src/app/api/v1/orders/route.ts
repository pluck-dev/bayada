import { orderService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";
import type { OrderType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = parseSearchParams(request.url);
    const result = await orderService.list({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
      status: params.status,
      type: params.type as OrderType | undefined,
      search: params.search,
    });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const body = await request.json();

    let order;
    if (body.type === "B2B") {
      order = await orderService.createB2BOrder(
        body.userId || user.id,
        body.organizationId,
        body.items
      );
    } else {
      order = await orderService.createB2COrder(body.userId || user.id, body.courseIds);
    }
    return successResponse(order, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
