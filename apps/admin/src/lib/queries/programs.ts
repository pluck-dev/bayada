import { prisma, type CourseStatus, type Prisma, type Visibility } from "@bayada/db";
import { COURSE_STATUSES } from "../labels";

export interface ProgramListFilter {
  q?: string;
  status?: string;
  visibility?: string;
}

function isStatus(s: string | undefined): s is CourseStatus {
  return !!s && (COURSE_STATUSES as string[]).includes(s);
}

export async function listPrograms(filter: ProgramListFilter) {
  const where: Prisma.CourseWhereInput = {};
  if (filter.q) {
    where.OR = [
      { title: { contains: filter.q, mode: "insensitive" } },
      { slug: { contains: filter.q, mode: "insensitive" } },
    ];
  }
  if (filter.visibility === "INTERNAL" || filter.visibility === "PUBLIC") {
    where.visibility = filter.visibility as Visibility;
  }
  // 상태 칩 숫자는 검색·공개범위 필터를 반영하고 상태 필터만 뺀 값
  const [rows, grouped] = await Promise.all([
    prisma.course.findMany({
      where: isStatus(filter.status) ? { ...where, status: filter.status } : where,
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        productType: true,
        learningMode: true,
        audiences: true,
        status: true,
        visibility: true,
        featured: true,
        updatedAt: true,
        provider: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.course.groupBy({ by: ["status"], where, _count: true }),
  ]);
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count])) as Partial<Record<CourseStatus, number>>;
  return { rows, counts };
}

export type ProgramRow = Awaited<ReturnType<typeof listPrograms>>["rows"][number];

export async function getProgram(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lectures: {
            orderBy: { order: "asc" },
            include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } },
          },
        },
      },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
}

export type ProgramDetail = NonNullable<Awaited<ReturnType<typeof getProgram>>>;

export function lectureCount(p: { sections: { lectures: unknown[] }[] }): number {
  return p.sections.reduce((n, s) => n + s.lectures.length, 0);
}

export async function getFormOptions() {
  const [categories, providers] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.provider.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isPartner: true } }),
  ]);
  return { categories, providers };
}

/** 프로그램 상태·이력 타임라인 (감사 로그 기반) */
export async function getProgramHistory(id: string) {
  const logs = await prisma.auditLog.findMany({
    where: { target: `Course:${id}` },
    orderBy: { at: "desc" },
    take: 100,
  });
  const actorIds = [...new Set(logs.map((l) => l.actorId).filter((x): x is string => !!x))];
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, email: true, role: true },
  });
  const byId = new Map(actors.map((a) => [a.id, a]));
  return logs.map((l) => ({ ...l, actor: l.actorId ? byId.get(l.actorId) ?? null : null }));
}

export type HistoryEntry = Awaited<ReturnType<typeof getProgramHistory>>[number];
