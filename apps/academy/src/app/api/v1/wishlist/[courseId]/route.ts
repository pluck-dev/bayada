import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";

type Ctx = { params: Promise<{ courseId: string }> };

/** 찜하기. 노출 규칙을 통과한 강의만 (사내 전용 강의 id 로 존재 여부를 떠보지 못하게) */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { courseId } = await params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, visibility: true },
    });
    if (!course || !isCourseListed(course, viewer)) {
      return NextResponse.json({ error: "프로그램을 찾을 수 없습니다" }, { status: 404 });
    }
    await prisma.wishlist.upsert({
      where: { userId_courseId: { userId: viewer.id, courseId } },
      create: { userId: viewer.id, courseId },
      update: {},
    });
    return NextResponse.json({ wished: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { courseId } = await params;
    await prisma.wishlist.deleteMany({ where: { userId: viewer.id, courseId } });
    return NextResponse.json({ wished: false });
  } catch (error) {
    return errorResponse(error);
  }
}
