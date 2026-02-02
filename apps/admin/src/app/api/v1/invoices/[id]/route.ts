import { invoiceService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const invoice = await invoiceService.getById(id);
    return successResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}
