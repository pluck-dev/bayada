import { prisma } from "@bayada/db";

export async function listOrganizations(q?: string) {
  return prisma.organization.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: [{ isInternal: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      bizNo: true,
      contact: true,
      isInternal: true,
      createdAt: true,
      _count: { select: { users: true, orders: true, assignments: true } },
      invites: { where: { acceptedAt: null }, select: { id: true } },
    },
  });
}

export async function getOrganization(id: string) {
  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bizNo: true,
      contact: true,
      isInternal: true,
      createdAt: true,
      _count: { select: { orders: true } },
      users: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true, customRoleKey: true, status: true, jobRole: true, createdAt: true },
      },
      invites: {
        where: { acceptedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, createdAt: true },
      },
    },
  });
  if (!org) return null;

  // 배정 과정별 배정 인원·수료 인원 — 수료는 해당 학습자의 같은 과정 Enrollment.completedAt 기준
  const assignments = await prisma.courseAssignment.findMany({
    where: { organizationId: id },
    select: { userId: true, courseId: true, dueAt: true, course: { select: { title: true } } },
  });
  const completed = assignments.length
    ? await prisma.enrollment.findMany({
        where: {
          userId: { in: [...new Set(assignments.map((a) => a.userId))] },
          courseId: { in: [...new Set(assignments.map((a) => a.courseId))] },
          completedAt: { not: null },
        },
        select: { userId: true, courseId: true },
      })
    : [];
  const done = new Set(completed.map((e) => `${e.userId}:${e.courseId}`));
  const byCourse = new Map<string, { courseId: string; title: string; assigned: number; completed: number; nextDue: Date | null }>();
  for (const a of assignments) {
    const row = byCourse.get(a.courseId) ?? { courseId: a.courseId, title: a.course.title, assigned: 0, completed: 0, nextDue: null };
    row.assigned += 1;
    if (done.has(`${a.userId}:${a.courseId}`)) row.completed += 1;
    if (a.dueAt && (!row.nextDue || a.dueAt < row.nextDue)) row.nextDue = a.dueAt;
    byCourse.set(a.courseId, row);
  }
  const courses = [...byCourse.values()].sort((a, b) => b.assigned - a.assigned);
  // 기관 관리자 먼저 (enum 정렬은 선언 순서라 DB 에서 하지 않는다)
  const users = [...org.users].sort((a, b) => Number(b.role === "ORG_ADMIN") - Number(a.role === "ORG_ADMIN"));
  return { ...org, users, courses };
}
