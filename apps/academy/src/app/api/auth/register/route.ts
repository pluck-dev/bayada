import { NextResponse } from "next/server";
import { userService } from "@/lib/services";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, name, phone } = body;
    // 로그인은 소문자 이메일로 조회한다
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !password || !name) {
      return NextResponse.json({ error: "이메일, 비밀번호, 이름은 필수입니다." }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }

    const user = await userService.create({ email, password, name, phone });
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
