import { sectionService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const sections = await sectionService.listByCourse(id);
    return successResponse(sections);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const section = await sectionService.create(id, body);
    return successResponse(section, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
