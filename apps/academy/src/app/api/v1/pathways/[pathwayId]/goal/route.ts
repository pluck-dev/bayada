import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";

type Ctx = { params: Promise<{ pathwayId: string }> };

/** 커리어 목표로 설정. 게시된 패스웨이만 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { pathwayId } = await params;
    const pathway = await prisma.pathway.findFirst({ where: { id: pathwayId, published: true }, select: { id: true } });
    if (!pathway) return NextResponse.json({ error: "커리어 패스웨이를 찾을 수 없습니다" }, { status: 404 });
    await prisma.pathwayGoal.upsert({
      where: { userId_pathwayId: { userId: viewer.id, pathwayId } },
      create: { userId: viewer.id, pathwayId },
      update: {},
    });
    return NextResponse.json({ goal: true });
  } catch (error) {
    return errorResponse(error);
  }
}

/** 목표 해제 — 게시 중단된 패스웨이도 해제할 수 있다 */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { pathwayId } = await params;
    await prisma.pathwayGoal.deleteMany({ where: { userId: viewer.id, pathwayId } });
    return NextResponse.json({ goal: false });
  } catch (error) {
    return errorResponse(error);
  }
}
