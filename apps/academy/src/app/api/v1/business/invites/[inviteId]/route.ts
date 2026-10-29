import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { canManageOrg } from "@/lib/queries/business";

type Ctx = { params: Promise<{ inviteId: string }> };

/** 대기 중인 초대 취소 (링크 무효화) */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!canManageOrg(viewer)) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    const { inviteId } = await params;
    const { count } = await prisma.orgInvite.deleteMany({
      where: { id: inviteId, organizationId: viewer.organizationId, acceptedAt: null },
    });
    if (!count) return NextResponse.json({ error: "초대를 찾을 수 없습니다" }, { status: 404 });
    return NextResponse.json({ revoked: true });
  } catch (error) {
    return errorResponse(error);
  }
}
