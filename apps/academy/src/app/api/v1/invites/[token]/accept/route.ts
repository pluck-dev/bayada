import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";

type Ctx = { params: Promise<{ token: string }> };

/**
 * 초대 수락: 로그인한 사용자를 초대한 기관에 소속시킨다.
 * 링크가 다른 사람에게 전달돼도 쓰이지 않게, 초대받은 이메일로 로그인한 경우에만 수락된다.
 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { token } = await params;
    const invite = await prisma.orgInvite.findUnique({
      where: { token },
      select: { id: true, email: true, organizationId: true, acceptedAt: true },
    });
    if (!invite || invite.acceptedAt) {
      return NextResponse.json({ error: "만료됐거나 이미 사용된 초대 링크예요" }, { status: 404 });
    }
    if (invite.email !== viewer.email.toLowerCase()) {
      return NextResponse.json({ error: "초대받은 이메일 계정으로 로그인해 주세요" }, { status: 403 });
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: viewer.id }, data: { organizationId: invite.organizationId } }),
      prisma.orgInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
      prisma.auditLog.create({
        data: {
          actorId: viewer.id,
          action: "org.join",
          target: `Organization:${invite.organizationId}`,
          detail: { inviteId: invite.id, from: viewer.organizationId },
        },
      }),
    ]);
    return NextResponse.json({ joined: true });
  } catch (error) {
    return errorResponse(error);
  }
}
