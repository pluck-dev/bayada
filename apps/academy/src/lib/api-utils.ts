import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ServiceError } from "@bayada/services";
import type { SessionUser } from "@bayada/shared/types";

/** 현재 세션 사용자 가져오기 (없으면 null) */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

/** 인증 필수 세션 가져오기 (없으면 401 응답) */
export async function requireSession(): Promise<
  | { user: SessionUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  const user = await getSession();
  if (!user) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 }) };
  }
  return { user };
}

/** 성공 응답 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** 에러 응답 */
export function errorResponse(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { error: error.message, ...(("errors" in error && error.errors) ? { errors: error.errors } : {}) },
      { status: error.statusCode }
    );
  }
  console.error("Unhandled error:", error);
  const detail = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ error: "서버 오류가 발생했습니다", detail }, { status: 500 });
}

/** URL 쿼리 파라미터를 객체로 파싱 */
export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
