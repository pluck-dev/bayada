import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { paymentService } from "@/lib/services";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";
import { getResumeLectureId } from "@/lib/queries/learning";

/**
 * 수강 신청. 무료 → 바로 등록, 유료 + via:"pass" → 유효한 아카데미 패스가 유형을 포함할 때 등록.
 * 이미 수강 중이면 그대로 성공 처리(이어보기 위치 반환). 유료 단건은 /checkout 에서 결제한다.
 */
export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { courseId?: unknown; via?: unknown };
    if (typeof body.courseId !== "string") {
      return NextResponse.json({ error: "courseId 가 필요합니다" }, { status: 400 });
    }
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { id: true, status: true, visibility: true, price: true, productType: true },
    });

    const existing = course
      ? await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
        })
      : null;
    // 패스가 끝난 패스 수강은 "수강 중"이 아니다 — 아래에서 다시 판정
    if (course && existing && (await paymentService.enrollmentActive(existing.id, viewer.id, course))) {
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
      if (body.via !== "pass") {
        return NextResponse.json({ error: "유료 프로그램은 결제 후 수강할 수 있어요" }, { status: 402 });
      }
      if (!(await paymentService.passCovers(viewer.id, course.productType))) {
        return NextResponse.json({ error: "이 프로그램을 포함하는 이용 중인 아카데미 패스가 없어요" }, { status: 402 });
      }
      // 패스가 끝났다가 다시 구독한 경우 기존 패스 수강 기록이 그대로 살아난다
      const enrollment = existing ?? (await paymentService.enrollWithPass(viewer.id, course));
      return NextResponse.json(
        { enrollmentId: enrollment.id, resumeLectureId: await getResumeLectureId(viewer.id, course.id) },
        { status: 201 }
      );
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
