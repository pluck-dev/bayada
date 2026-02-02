import { organizationService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const members = await organizationService.getMembers(id);
    return successResponse(members);
  } catch (error) {
    return errorResponse(error);
  }
}
