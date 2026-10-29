import { prisma, type CredentialAppStatus, type Prisma } from "@bayada/db";
import { CREDENTIAL_APP_STATUSES } from "../credentials";

// ─── 인증 과정 ───

export async function listCredentialPrograms() {
  return prisma.credentialProgram.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { applications: true, credentials: true } } },
  });
}

export async function getCredentialProgram(id: string) {
  return prisma.credentialProgram.findUnique({
    where: { id },
    include: { _count: { select: { applications: true, credentials: true } } },
  });
}

/** 선수 강의로 고를 수 있는 프로그램 — 게시된 것 + 이미 선택돼 있던 것(보관됐어도 선택값이 사라지지 않게) */
export async function requiredCourseOptions(selected: string[] = []) {
  const rows = await prisma.course.findMany({
    where: { OR: [{ status: "PUBLISHED" }, { id: { in: selected } }] },
    select: { id: true, title: true, status: true, provider: { select: { name: true } } },
    orderBy: { title: "asc" },
  });
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    note: [c.provider?.name, c.status === "PUBLISHED" ? null : "게시 중 아님"].filter(Boolean).join(" · "),
  }));
}

// ─── 심사 큐 ───

export async function listApplications(filter: { status?: CredentialAppStatus; programId?: string }) {
  const scope: Prisma.CredentialApplicationWhereInput = filter.programId ? { programId: filter.programId } : {};
  const [rows, grouped, programs] = await Promise.all([
    prisma.credentialApplication.findMany({
      where: { ...scope, ...(filter.status ? { status: filter.status } : {}) },
      // 처리할 일이 오래된 것부터 위로
      orderBy: [{ updatedAt: filter.status && !["APPROVED", "REJECTED"].includes(filter.status) ? "asc" : "desc" }],
      take: 200,
      select: {
        id: true,
        status: true,
        examScore: true,
        practicalScore: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
        evaluator: { select: { name: true, email: true } },
        program: {
          select: { id: true, title: true, examPassingScore: true, practicalRequired: true, practicalPassingScore: true },
        },
      },
    }),
    prisma.credentialApplication.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    prisma.credentialProgram.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  const counts = Object.fromEntries(CREDENTIAL_APP_STATUSES.map((s) => [s, 0])) as Record<CredentialAppStatus, number>;
  for (const g of grouped) counts[g.status] = g._count._all;
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  return { rows, counts, all, programs };
}

export async function getApplication(id: string) {
  const app = await prisma.credentialApplication.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, jobRole: true, organization: { select: { name: true } } } },
      evaluator: { select: { id: true, name: true, email: true } },
      program: true,
    },
  });
  if (!app) return null;
  // 선수 강의 이수 여부는 저장하지 않고 매번 Enrollment.completedAt 으로 계산
  const [courses, enrollments, credentials, history] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: app.program.requiredCourseIds } }, select: { id: true, title: true } }),
    prisma.enrollment.findMany({
      where: { userId: app.userId, courseId: { in: app.program.requiredCourseIds } },
      select: { courseId: true, progressPercent: true, completedAt: true },
    }),
    prisma.credential.findMany({
      where: { userId: app.userId, programId: app.programId },
      orderBy: { issuedAt: "desc" },
      select: { id: true, number: true, issuedAt: true, expiresAt: true, revokedAt: true },
    }),
    prisma.auditLog.findMany({
      where: { target: `CredentialApplication:${id}` },
      orderBy: { at: "asc" },
      select: { id: true, action: true, at: true, detail: true, actorId: true },
    }),
  ]);
  const byCourse = new Map(enrollments.map((e) => [e.courseId, e]));
  const titleOf = new Map(courses.map((c) => [c.id, c.title]));
  const prerequisites = app.program.requiredCourseIds.map((cid) => {
    const e = byCourse.get(cid);
    return {
      courseId: cid,
      title: titleOf.get(cid) ?? "삭제된 프로그램",
      enrolled: !!e,
      progressPercent: e ? (e.completedAt ? 100 : e.progressPercent) : 0,
      completedAt: e?.completedAt ?? null,
    };
  });
  const actorIds = [...new Set(history.map((h) => h.actorId).filter((x): x is string => !!x))];
  const actors = await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } });
  const actorName = new Map(actors.map((a) => [a.id, a.name ?? a.email]));
  return {
    app,
    prerequisites,
    credentials,
    history: history.map((h) => ({ ...h, actor: h.actorId ? (actorName.get(h.actorId) ?? "-") : "-" })),
  };
}

// ─── 발급된 인증 ───

export type IssuedFilter = "active" | "expiring" | "expired" | "revoked" | "all";

export async function listCredentials(filter: IssuedFilter, programId?: string) {
  const now = new Date();
  const scope: Prisma.CredentialWhereInput = programId ? { programId } : {};
  const active: Prisma.CredentialWhereInput = { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
  const expired: Prisma.CredentialWhereInput = { revokedAt: null, expiresAt: { lte: now } };
  const revoked: Prisma.CredentialWhereInput = { revokedAt: { not: null } };

  const rows = await prisma.credential.findMany({
    where: {
      ...scope,
      ...(filter === "active" || filter === "expiring" ? active : filter === "expired" ? expired : filter === "revoked" ? revoked : {}),
    },
    orderBy: filter === "expiring" ? { expiresAt: "asc" } : { issuedAt: "desc" },
    take: 500,
    select: {
      id: true,
      number: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      renewalNotifiedAt: true,
      user: { select: { id: true, name: true, email: true } },
      program: { select: { id: true, title: true, renewalNoticeDays: true } },
    },
  });

  // 만료 임박 = 과정마다 다른 알림 기간(renewalNoticeDays) 안에 들어온 것 → DB 한 번에 못 거르므로 여기서 거른다
  const inWindow = (r: (typeof rows)[number]) =>
    !!r.expiresAt && !r.revokedAt && r.expiresAt > now && r.expiresAt.getTime() - now.getTime() <= r.program.renewalNoticeDays * 86400_000;

  const [activeCount, expiredCount, revokedCount, windowRows, programs] = await Promise.all([
    prisma.credential.count({ where: { ...scope, ...active } }),
    prisma.credential.count({ where: { ...scope, ...expired } }),
    prisma.credential.count({ where: { ...scope, ...revoked } }),
    prisma.credential.findMany({
      where: { ...scope, revokedAt: null, expiresAt: { gt: now } },
      select: { expiresAt: true, program: { select: { renewalNoticeDays: true } } },
    }),
    prisma.credentialProgram.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  const expiringCount = windowRows.filter(
    (r) => r.expiresAt!.getTime() - now.getTime() <= r.program.renewalNoticeDays * 86400_000,
  ).length;

  return {
    rows: filter === "expiring" ? rows.filter(inWindow) : rows,
    inWindow,
    counts: {
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
      revoked: revokedCount,
      all: activeCount + expiredCount + revokedCount,
    },
    programs,
  };
}
