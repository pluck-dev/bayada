import { prisma } from "@bayada/db";

export async function listPartners() {
  return prisma.provider.findMany({
    where: { isPartner: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      _count: { select: { courses: true } },
      admins: { where: { role: "PARTNER_ADMIN" }, select: { id: true, name: true, email: true }, orderBy: { email: "asc" } },
    },
  });
}

export async function getPartner(id: string) {
  return prisma.provider.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      isPartner: true,
      description: true,
      admins: {
        where: { role: "PARTNER_ADMIN" },
        orderBy: { email: "asc" },
        select: { id: true, name: true, email: true, updatedAt: true },
      },
      courses: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, status: true, updatedAt: true, _count: { select: { enrollments: true } } },
      },
    },
  });
}

/**
 * 파트너 콘솔 통계 — 수강 인원과 수료율만 (학습자 식별 정보는 내보내지 않는다).
 * providerId 는 세션에서 온 값만 넘길 것.
 */
export async function getPartnerConsole(providerId: string) {
  const [provider, courses, completions] = await Promise.all([
    prisma.provider.findUnique({ where: { id: providerId }, select: { id: true, name: true, logo: true, description: true } }),
    prisma.course.findMany({
      where: { providerId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        productType: true,
        learningMode: true,
        reviewNote: true,
        updatedAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { course: { providerId }, completedAt: { not: null } },
      _count: true,
    }),
  ]);
  const doneBy = new Map(completions.map((c) => [c.courseId, c._count]));
  const rows = courses.map((c) => ({ ...c, enrollments: c._count.enrollments, completed: doneBy.get(c.id) ?? 0 }));
  const enrollments = rows.reduce((n, r) => n + r.enrollments, 0);
  const completed = rows.reduce((n, r) => n + r.completed, 0);
  return { provider, rows, totals: { enrollments, completed } };
}
