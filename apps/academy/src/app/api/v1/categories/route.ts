import { categoryService } from "@/lib/services";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const categories = await categoryService.list();
    return successResponse(categories);
  } catch (error) {
    return errorResponse(error);
  }
}
