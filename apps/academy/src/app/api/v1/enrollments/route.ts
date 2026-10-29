import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";
import { getResumeLectureId } from "@/lib/queries/learning";

/** 무료 수강 신청. 이미 수강 중이면 그대로 성공 처리(이어보기 위치 반환) */
export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { courseId?: unknown };
    if (typeof body.courseId !== "string") {
      return NextResponse.json({ error: "courseId 가 필요합니다" }, { status: 400 });
    }
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { id: true, status: true, visibility: true, price: true },
    });

    const existing = course
      ? await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
        })
      : null;
    if (course && existing) {
      return NextResponse.json({
        enrollmentId: existing.id,
        resumeLectureId: await getResumeLectureId(viewer.id, course.id),
      });
    }
    // 노출 규칙을 통과하지 못하면 존재 자체를 알리지 않는다
    if (!course || !isCourseListed(course, viewer)) {
      return NextResponse.json({ error: "프로그램을 찾을 수 없습니다" }, { status: 404 });
    }
    if (course.price > 0) {
      return NextResponse.json({ error: "유료 프로그램은 기관 도입 문의로 신청해 주세요" }, { status: 402 });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
      create: { userId: viewer.id, courseId: course.id },
      update: {},
    });
    return NextResponse.json(
      { enrollmentId: enrollment.id, resumeLectureId: await getResumeLectureId(viewer.id, course.id) },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
