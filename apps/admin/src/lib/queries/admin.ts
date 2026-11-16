import { prisma, type CourseStatus, type Prisma, type Role, type UserStatus } from "@bayada/db";
import { ROLES } from "../labels";
import { QUEUE_STATUSES } from "../workflow";
import { OPEN_REPORT_WHERE } from "./reviews";
import { upcomingSessionCount } from "./sessions";

// ─── 대시보드 ───
/** 한국 시간 기준 이번 달 1일 0시 */
function monthStartKst(now = new Date()): Date {
  const kst = new Date(now.getTime() + 9 * 3600_000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), 1) - 9 * 3600_000);
}

export async function getDashboard() {
  const since = monthStartKst();
  const [
    byStatus,
    byVisibility,
    pendingSignups,
    enrollmentsMonth,
    completionsMonth,
    certificatesMonth,
    queue,
    recent,
    openReports,
    upcomingSessions,
  ] = await Promise.all([
      prisma.course.groupBy({ by: ["status"], _count: true }),
      prisma.course.groupBy({ by: ["visibility"], where: { status: "PUBLISHED" }, _count: true }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.enrollment.count({ where: { createdAt: { gte: since } } }),
      prisma.enrollment.count({ where: { completedAt: { gte: since } } }),
      prisma.certificate.count({ where: { issuedAt: { gte: since } } }),
      prisma.course.findMany({
        where: { status: { in: QUEUE_STATUSES } },
        orderBy: { updatedAt: "asc" },
        take: 6,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: 8 }),
      prisma.review.count({ where: OPEN_REPORT_WHERE }),
      upcomingSessionCount(14),
    ]);
  const statusCounts = Object.fromEntries(byStatus.map((g) => [g.status, g._count])) as Partial<Record<CourseStatus, number>>;
  const visibilityCounts = Object.fromEntries(byVisibility.map((g) => [g.visibility, g._count])) as Partial<
    Record<"INTERNAL" | "PUBLIC", number>
  >;
  return {
    since,
    statusCounts,
    visibilityCounts,
    pendingSignups,
    enrollmentsMonth,
    completionsMonth,
    certificatesMonth,
    queue,
    openReports,
    upcomingSessions,
    recent: await withActors(recent),
  };
}

// ─── 승인 대기 큐 ───
export async function listQueue(statuses: CourseStatus[]) {
  return prisma.course.findMany({
    where: { status: { in: statuses } },
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      productType: true,
      audiences: true,
      updatedAt: true,
      reviewNote: true,
      provider: { select: { name: true } },
    },
  });
}

// ─── 회원 ───
export interface MemberFilter {
  q?: string;
  status?: string;
  role?: string;
  org?: string; // internal | external
  page?: number;
}

export const MEMBER_PAGE_SIZE = 50;

export async function listMembers(f: MemberFilter) {
  const and: Prisma.UserWhereInput[] = [];
  if (f.q) {
    and.push({
      OR: [
        { email: { contains: f.q, mode: "insensitive" } },
        { name: { contains: f.q, mode: "insensitive" } },
      ],
    });
  }
  if (f.status === "PENDING" || f.status === "APPROVED" || f.status === "REJECTED") and.push({ status: f.status as UserStatus });
  // 시스템 역할 필터는 사용자 정의 역할이 붙은 계정을 뺀다 (그 계정들은 role=STUDENT 로 저장됨)
  if (f.role && (ROLES as string[]).includes(f.role)) and.push({ role: f.role as Role, customRoleKey: null });
  else if (f.role) and.push({ customRoleKey: f.role });
  if (f.org === "internal") and.push({ organization: { isInternal: true } });
  if (f.org === "external") and.push({ OR: [{ organizationId: null }, { organization: { isInternal: false } }] });
  const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};
  const page = Math.max(1, f.page ?? 1);
  const [rows, total, statusGroups] = await Promise.all([
    prisma.user.findMany({
      where,
      // 승인 대기가 위로 오게
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * MEMBER_PAGE_SIZE,
      take: MEMBER_PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        customRoleKey: true,
        status: true,
        jobRole: true,
        createdAt: true,
        organization: { select: { name: true, isInternal: true } },
        _count: { select: { enrollments: true, certificates: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({ by: ["status"], _count: true }),
  ]);
  const statusCounts = Object.fromEntries(statusGroups.map((g) => [g.status, g._count])) as Partial<Record<UserStatus, number>>;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / MEMBER_PAGE_SIZE)), statusCounts };
}

export async function getMember(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      customRoleKey: true,
      status: true,
      jobRole: true,
      legacyWpId: true,
      createdAt: true,
      organization: { select: { id: true, name: true, isInternal: true } },
      progresses: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, completed: true, completedAt: true, watchedSec: true,
          lecture: { select: { title: true, section: { select: { course: { select: { title: true } } } } } },
        },
      },
      quizAttempts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, score: true, passed: true, createdAt: true,
          quiz: { select: { lecture: { select: { title: true, section: { select: { course: { select: { title: true } } } } } } } },
        },
      },
      enrollments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          progressPercent: true,
          completedAt: true,
          createdAt: true,
          course: { select: { id: true, title: true, status: true } },
        },
      },
      certificates: {
        orderBy: { issuedAt: "desc" },
        select: { id: true, number: true, issuedAt: true, expiresAt: true, course: { select: { title: true } } },
      },
    },
  });
}

// ─── 감사 로그 ───
export interface AuditFilter {
  action?: string; // prefix: course / banner / user ...
  actor?: string;
  q?: string; // target 검색
  page?: number;
}

export const AUDIT_PAGE_SIZE = 50;

export async function listAudit(f: AuditFilter) {
  const where: Prisma.AuditLogWhereInput = {};
  if (f.action) where.action = f.action.includes(".") ? f.action : { startsWith: `${f.action}.` };
  if (f.actor) where.actorId = f.actor;
  if (f.q) where.target = { contains: f.q };
  const page = Math.max(1, f.page ?? 1);
  const [rows, total, actorIds] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { at: "desc" }, skip: (page - 1) * AUDIT_PAGE_SIZE, take: AUDIT_PAGE_SIZE }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ["actorId"], select: { actorId: true } }),
  ]);
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds.map((a) => a.actorId).filter((x): x is string => !!x) } },
    select: { id: true, name: true, email: true },
  });
  return {
    rows: await withActors(rows),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)),
    actors,
  };
}

async function withActors<T extends { actorId: string | null }>(rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.actorId).filter((x): x is string => !!x))];
  const users = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })
    : [];
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => ({ ...r, actor: r.actorId ? byId.get(r.actorId) ?? null : null }));
}

/** target "Course:id" → 표시용 이름 */
export async function resolveTargets(targets: string[]) {
  const ids = (type: string) => targets.filter((t) => t.startsWith(`${type}:`)).map((t) => t.slice(type.length + 1));
  const [courses, users, banners, pages, sessions, orgs, reviews, inquiries, posts, faqs] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: ids("Course") } }, select: { id: true, title: true } }),
    prisma.user.findMany({ where: { id: { in: ids("User") } }, select: { id: true, email: true } }),
    prisma.banner.findMany({ where: { id: { in: ids("Banner") } }, select: { id: true, title: true } }),
    prisma.page.findMany({ where: { id: { in: ids("Page") } }, select: { id: true, title: true } }),
    prisma.trainingSession.findMany({ where: { id: { in: ids("TrainingSession") } }, select: { id: true, title: true } }),
    prisma.organization.findMany({ where: { id: { in: ids("Organization") } }, select: { id: true, name: true } }),
    prisma.review.findMany({ where: { id: { in: ids("Review") } }, select: { id: true, course: { select: { title: true } } } }),
    prisma.webInquiry.findMany({ where: { id: { in: ids("WebInquiry") } }, select: { id: true, referenceNo: true } }),
    prisma.webBlogPost.findMany({ where: { id: { in: ids("WebBlogPost") } }, select: { id: true, title: true } }),
    prisma.webFaqItem.findMany({ where: { id: { in: ids("WebFaqItem") } }, select: { id: true, question: true } }),
  ]);
  const map = new Map<string, string>();
  courses.forEach((c) => map.set(`Course:${c.id}`, c.title));
  users.forEach((u) => map.set(`User:${u.id}`, u.email));
  banners.forEach((b) => map.set(`Banner:${b.id}`, b.title));
  pages.forEach((p) => map.set(`Page:${p.id}`, p.title));
  sessions.forEach((s) => map.set(`TrainingSession:${s.id}`, s.title));
  orgs.forEach((o) => map.set(`Organization:${o.id}`, o.name));
  reviews.forEach((r) => map.set(`Review:${r.id}`, `${r.course.title} 후기`));
  inquiries.forEach((i) => map.set(`WebInquiry:${i.id}`, `홈페이지 문의 ${i.referenceNo}`));
  posts.forEach((p) => map.set(`WebBlogPost:${p.id}`, p.title));
  faqs.forEach((f) => map.set(`WebFaqItem:${f.id}`, f.question));
  return map;
}

// ─── 배너·큐레이션 ───
export async function getCuration() {
  const [banners, featured, candidates] = await Promise.all([
    prisma.banner.findMany({ orderBy: [{ order: "asc" }, { startsAt: "asc" }] }),
    prisma.course.findMany({
      where: { featured: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true, visibility: true, productType: true },
    }),
    prisma.course.findMany({
      where: { featured: false, status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, visibility: true },
    }),
  ]);
  return { banners, featured, candidates };
}

// ─── 택소노미 ───
export async function getTaxonomy() {
  const [categories, providers] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], include: { _count: { select: { courses: true } } } }),
    prisma.provider.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { courses: true } } } }),
  ]);
  return { categories, providers };
}
