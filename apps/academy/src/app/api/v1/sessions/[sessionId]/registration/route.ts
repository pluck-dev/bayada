import { NextResponse } from "next/server";
import { prisma, Prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { paymentService } from "@/lib/services";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";

type Ctx = { params: Promise<{ sessionId: string }> };

class RegistrationError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/**
 * 실습 일정 신청. 조건: 해당 강의 수강 중이거나, 노출 가능한 무료 강의.
 * 정원 확인 + 등록을 한 트랜잭션에서 하고, 세션 행을 FOR UPDATE 로 잠가 동시 신청이 정원을 넘지 못하게 한다.
 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { sessionId } = await params;

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        startsAt: true,
        course: { select: { id: true, status: true, visibility: true, price: true, productType: true } },
      },
    });
    if (!session || !session.course) return NextResponse.json({ error: "일정을 찾을 수 없습니다" }, { status: 404 });
    const course = session.course;
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
      select: { id: true },
    });
    if (enrolled && !(await paymentService.enrollmentActive(enrolled.id, viewer.id, course))) {
      return NextResponse.json({ error: "수강 권한이 만료되었습니다. 이용 중인 패스나 구매 내역을 확인해 주세요." }, { status: 403 });
    }
    if (!enrolled) {
      if (!isCourseListed(course, viewer))
        return NextResponse.json({ error: "일정을 찾을 수 없습니다" }, { status: 404 });
      if (course.price > 0) {
        return NextResponse.json({ error: "수강 중인 프로그램의 실습만 신청할 수 있어요" }, { status: 403 });
      }
    }
    if (session.startsAt <= new Date()) {
      return NextResponse.json({ error: "이미 시작했거나 지난 일정이에요" }, { status: 400 });
    }

    const remaining = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ capacity: number }[]>`
        SELECT capacity FROM "TrainingSession" WHERE id = ${sessionId} FOR UPDATE`;
      const capacity = rows[0]?.capacity ?? 0;
      const mine = await tx.sessionRegistration.findUnique({
        where: { sessionId_userId: { sessionId, userId: viewer.id } },
        select: { userId: true },
      });
      const taken = await tx.sessionRegistration.count({ where: { sessionId } });
      if (mine) return capacity - taken;
      if (taken >= capacity) throw new RegistrationError("정원이 마감됐어요", 409);
      await tx.sessionRegistration.create({ data: { sessionId, userId: viewer.id } });
      return capacity - taken - 1;
    });
    return NextResponse.json({ registered: true, remaining }, { status: 201 });
  } catch (error) {
    if (error instanceof RegistrationError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ registered: true });
    }
    return errorResponse(error);
  }
}

/** 신청 취소 (시작 전까지만) */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { sessionId } = await params;
    const session = await prisma.trainingSession.findUnique({ where: { id: sessionId }, select: { startsAt: true } });
    if (!session) return NextResponse.json({ error: "일정을 찾을 수 없습니다" }, { status: 404 });
    if (session.startsAt <= new Date()) {
      return NextResponse.json({ error: "시작한 일정은 취소할 수 없어요" }, { status: 400 });
    }
    await prisma.sessionRegistration.deleteMany({ where: { sessionId, userId: viewer.id } });
    return NextResponse.json({ registered: false });
  } catch (error) {
    return errorResponse(error);
  }
}
