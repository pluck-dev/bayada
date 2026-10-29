import { prisma, type Prisma } from "@bayada/db";
import { LEARNING_MODE_LABEL } from "../labels";

export type SessionScope = "upcoming" | "past" | "all";

export async function listSessions(scope: SessionScope) {
  const now = new Date();
  // 진행 중(시작했지만 안 끝난) 일정은 '예정'에 둔다
  const where: Prisma.TrainingSessionWhereInput =
    scope === "upcoming" ? { endsAt: { gte: now } } : scope === "past" ? { endsAt: { lt: now } } : {};
  const [rows, upcoming, past] = await Promise.all([
    prisma.trainingSession.findMany({
      where,
      orderBy: { startsAt: scope === "past" ? "desc" : "asc" },
      select: {
        id: true,
        title: true,
        region: true,
        location: true,
        startsAt: true,
        endsAt: true,
        capacity: true,
        course: { select: { id: true, title: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.trainingSession.count({ where: { endsAt: { gte: now } } }),
    prisma.trainingSession.count({ where: { endsAt: { lt: now } } }),
  ]);
  return { rows, counts: { upcoming, past, all: upcoming + past } };
}

export async function getSession(id: string) {
  return prisma.trainingSession.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      registrations: {
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, user: { select: { id: true, name: true, email: true, phone: true } } },
      },
    },
  });
}

/** 일정에 연결할 프로그램 — 실습이 붙는 학습 방식(블렌디드·오프라인)을 위로 */
export async function sessionCourseOptions() {
  const rows = await prisma.course.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, title: true, learningMode: true },
    orderBy: { title: "asc" },
  });
  const rank = (m: string) => (m === "BLENDED" || m === "OFFLINE" ? 0 : 1);
  return rows
    .sort((a, b) => rank(a.learningMode) - rank(b.learningMode))
    .map((c) => ({ id: c.id, title: c.title, mode: LEARNING_MODE_LABEL[c.learningMode].split(" ")[0] }));
}

/** 앞으로 days 일 안에 시작하는 일정 수 (대시보드) */
export async function upcomingSessionCount(days: number) {
  const now = new Date();
  return prisma.trainingSession.count({ where: { startsAt: { gte: now, lte: new Date(now.getTime() + days * 86400_000) } } });
}
