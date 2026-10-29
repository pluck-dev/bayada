import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { canWriteReview, REVIEW_MIN_PROGRESS } from "@/lib/queries/engagement";

type Ctx = { params: Promise<{ courseId: string }> };

const MAX_LEN = 1000;

/** 후기 작성·수정 (강의당 1개). 진도 80% 이상 또는 수료한 수강생만 */
export async function PUT(request: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { courseId } = await params;

    const body = (await request.json().catch(() => ({}))) as {
      rating?: unknown;
      content?: unknown;
      showName?: unknown;
    };
    const rating = Number(body.rating);
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "별점을 1~5점으로 골라 주세요" }, { status: 400 });
    }
    if (content.length < 10) return NextResponse.json({ error: "후기를 10자 이상 적어 주세요" }, { status: 400 });
    if (content.length > MAX_LEN) {
      return NextResponse.json({ error: `후기는 ${MAX_LEN}자까지 쓸 수 있어요` }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: viewer.id, courseId } },
      select: { progressPercent: true, completedAt: true },
    });
    if (!canWriteReview(enrollment)) {
      return NextResponse.json(
        { error: `진도율 ${REVIEW_MIN_PROGRESS}% 이상이거나 수료한 프로그램에만 후기를 남길 수 있어요` },
        { status: 403 }
      );
    }

    const data = { rating, content, showName: body.showName === true };
    // 숨김 처리된 후기는 수정해도 숨김 상태를 유지한다 (status 는 건드리지 않음)
    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: viewer.id, courseId } },
      create: { userId: viewer.id, courseId, ...data },
      update: data,
      select: { id: true, status: true },
    });
    return NextResponse.json(review);
  } catch (error) {
    return errorResponse(error);
  }
}
