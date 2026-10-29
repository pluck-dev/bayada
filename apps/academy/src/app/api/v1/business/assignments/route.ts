import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { canManageOrg } from "@/lib/queries/business";
import { visibleCourseWhere } from "@/lib/queries/courses";

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && x.length > 0))] : [];

/**
 * 과정 배정: 강의 × 직원 조합마다 CourseAssignment 를 만들고, 수강(Enrollment)이 없으면 같이 만든다.
 * 이미 배정된 조합은 이수 기한만 새 값으로 바꾼다.
 */
export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!canManageOrg(viewer)) return NextResponse.json({ error: "기관 관리자만 배정할 수 있어요" }, { status: 403 });
    const organizationId = viewer.organizationId;

    const body = (await request.json().catch(() => ({}))) as {
      courseIds?: unknown;
      userIds?: unknown;
      dueDate?: unknown;
    };
    const courseIds = strings(body.courseIds);
    const userIds = strings(body.userIds);
    if (!courseIds.length || !userIds.length) {
      return NextResponse.json({ error: "과정과 직원을 한 명 이상 골라 주세요" }, { status: 400 });
    }
    if (courseIds.length > 50 || userIds.length > 500) {
      return NextResponse.json({ error: "한 번에 과정 50개, 직원 500명까지 배정할 수 있어요" }, { status: 400 });
    }

    let dueAt: Date | null = null;
    if (typeof body.dueDate === "string" && body.dueDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
        return NextResponse.json({ error: "이수 기한 형식을 확인해 주세요" }, { status: 400 });
      }
      // 기한 날짜의 한국 시간 하루 끝까지
      dueAt = new Date(`${body.dueDate}T23:59:59+09:00`);
      if (Number.isNaN(dueAt.getTime()))
        return NextResponse.json({ error: "이수 기한을 확인해 주세요" }, { status: 400 });
      if (dueAt < new Date())
        return NextResponse.json({ error: "이수 기한은 오늘 이후로 정해 주세요" }, { status: 400 });
    }

    // 관리자가 볼 수 있는 강의, 같은 기관 직원만
    const [courses, members] = await Promise.all([
      prisma.course.findMany({ where: { id: { in: courseIds }, ...visibleCourseWhere(viewer) }, select: { id: true } }),
      prisma.user.findMany({
        where: { id: { in: userIds }, organizationId, status: "APPROVED" },
        select: { id: true },
      }),
    ]);
    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: "배정할 수 없는 과정이 포함돼 있어요" }, { status: 400 });
    }
    if (members.length !== userIds.length) {
      return NextResponse.json({ error: "가입이 승인된 우리 기관 직원만 배정할 수 있어요" }, { status: 400 });
    }

    const pairs = courses.flatMap((c) => members.map((m) => ({ courseId: c.id, userId: m.id })));
    const [, assigned, enrolled] = await prisma.$transaction([
      prisma.courseAssignment.updateMany({
        where: { organizationId, courseId: { in: courseIds }, userId: { in: userIds } },
        data: { dueAt },
      }),
      prisma.courseAssignment.createMany({
        data: pairs.map((p) => ({ ...p, organizationId, dueAt })),
        skipDuplicates: true,
      }),
      prisma.enrollment.createMany({ data: pairs, skipDuplicates: true }),
      prisma.auditLog.create({
        data: {
          actorId: viewer.id,
          action: "org.assign",
          target: `Organization:${organizationId}`,
          detail: { courseIds, userIds, dueAt: dueAt?.toISOString() ?? null },
        },
      }),
    ]);
    return NextResponse.json(
      { pairs: pairs.length, newAssignments: assigned.count, newEnrollments: enrolled.count },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
