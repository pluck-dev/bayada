import { invoiceService } from "@/lib/services";
import { requireSession, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (session.error) return session.error;

    const { id } = await params;
    const invoice = await invoiceService.getByOrder(id);
    return successResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}
