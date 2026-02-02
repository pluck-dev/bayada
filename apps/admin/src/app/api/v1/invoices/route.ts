import { invoiceService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";
import type { InvoiceStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = parseSearchParams(request.url);
    const result = await invoiceService.list({
      page: params.page ? Number(params.page) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
      status: params.status as InvoiceStatus | undefined,
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

    const { orderId, dueDate } = await request.json();
    const invoice = await invoiceService.create(orderId, new Date(dueDate));
    return successResponse(invoice, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
