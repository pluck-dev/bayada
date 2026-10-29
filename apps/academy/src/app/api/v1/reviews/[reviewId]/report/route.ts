import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";

type Ctx = { params: Promise<{ reviewId: string }> };

/**
 * 후기 신고. 사용자당 1회 — 신고 기록은 AuditLog(action=review.report, target=Review:id, actorId) 로 남기고
 * 같은 사람이 다시 신고하면 거절한다. reportCount 는 어드민 검토 큐 정렬용.
 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { reviewId } = await params;
    const target = `Review:${reviewId}`;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, status: true, updatedAt: true },
    });
    if (!review || review.status !== "PUBLISHED") {
      return NextResponse.json({ error: "후기를 찾을 수 없습니다" }, { status: 404 });
    }
    if (review.userId === viewer.id) {
      return NextResponse.json({ error: "내 후기는 신고할 수 없어요" }, { status: 400 });
    }

    const lockKey = `${viewer.id}:${target}`;
    const result = await prisma.$transaction(async (tx) => {
      // 같은 사용자의 동시 신고를 한 줄로 세운다 (트랜잭션 범위 advisory lock)
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      const already = await tx.auditLog.findFirst({
        where: { actorId: viewer.id, action: "review.report", target },
        select: { id: true },
      });
      if (already) return null;
      await tx.auditLog.create({ data: { actorId: viewer.id, action: "review.report", target } });
      return tx.review.update({
        where: { id: reviewId },
        // updatedAt 은 '수정됨' 표시에 쓰이므로 신고 집계로는 바꾸지 않는다
        data: { reportCount: { increment: 1 }, updatedAt: review.updatedAt },
        select: { reportCount: true },
      });
    });
    if (!result) return NextResponse.json({ error: "이미 신고한 후기예요" }, { status: 409 });
    return NextResponse.json({ reported: true });
  } catch (error) {
    return errorResponse(error);
  }
}
