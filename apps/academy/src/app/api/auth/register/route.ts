import { userService } from "@/lib/services";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return errorResponse({
        statusCode: 400,
        message: "이메일, 비밀번호, 이름은 필수입니다.",
      });
    }

    if (password.length < 6) {
      return errorResponse({
        statusCode: 400,
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    }

    const user = await userService.create({ email, password, name, phone });
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
