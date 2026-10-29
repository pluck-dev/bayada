import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { isJobRole } from "@/lib/signup-policy";

// 소셜 첫 로그인 후 직군 한 번 받기 (가입 폼과 같은 선택지). 이미 정했으면 덮어쓰지 않는다.
export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { jobRole?: unknown };
  if (!isJobRole(body.jobRole)) return NextResponse.json({ error: "직군을 선택해 주세요." }, { status: 400 });
  await prisma.user.updateMany({ where: { id: viewer.id, jobRole: null }, data: { jobRole: body.jobRole } });
  return NextResponse.json({ ok: true });
}
