import { categoryService } from "@/lib/services";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const categories = await categoryService.list();
    return successResponse(categories);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const category = await categoryService.create(body);
    return successResponse(category, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
