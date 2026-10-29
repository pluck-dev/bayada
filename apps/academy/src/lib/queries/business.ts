import { prisma } from "@bayada/db";
import type { JobRole, UserStatus } from "@bayada/db";
import type { Viewer } from "@/lib/viewer";
import { visibleCourseWhere } from "@/lib/queries/courses";

/** 기관 대시보드 권한: 조직에 소속된 기관 관리자(ORG_ADMIN) 또는 전체 관리자(ADMIN) */
export function canManageOrg(viewer: Viewer | null): viewer is Viewer & { organizationId: string } {
  return !!viewer?.organizationId && (viewer.role === "ORG_ADMIN" || viewer.role === "ADMIN");
}

/** 기한 임박 기준(일) · 수료증 만료 예정 기준(일) */
export const DUE_SOON_DAYS = 14;
export const EXPIRY_SOON_DAYS = 30;

const DAY = 24 * 60 * 60 * 1000;

export type AssignmentState = "done" | "progress" | "todo";

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  jobRole: JobRole | null;
  isOrgAdmin: boolean;
  status: UserStatus;
  assigned: { courseId: string; title: string; dueAt: Date | null; progress: number; completedAt: Date | null }[];
  assignedDone: number;
  enrolledCount: number;
  completedCount: number;
  lastExpiry: Date | null;
}

/** 기관 대시보드 전체 데이터 (조직 단위, 한 번에 읽는다) */
export async function getOrgDashboard(organizationId: string) {
  const now = new Date();
  const [organization, users, invites] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: { organizationId },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        jobRole: true,
        role: true,
        status: true,
        enrollments: { select: { courseId: true, progressPercent: true, completedAt: true } },
        assignments: {
          where: { organizationId },
          orderBy: { createdAt: "asc" },
          select: { courseId: true, dueAt: true, course: { select: { title: true } } },
        },
        certificates: {
          where: { expiresAt: { not: null } },
          select: { number: true, expiresAt: true, course: { select: { title: true } } },
        },
      },
    }),
    prisma.orgInvite.findMany({
      where: { organizationId, acceptedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, token: true, createdAt: true },
    }),
  ]);

  const members: MemberRow[] = users.map((u) => {
    const byCourse = new Map(u.enrollments.map((e) => [e.courseId, e]));
    const assigned = u.assignments.map((a) => {
      const e = byCourse.get(a.courseId);
      return {
        courseId: a.courseId,
        title: a.course.title,
        dueAt: a.dueAt,
        progress: e?.completedAt ? 100 : (e?.progressPercent ?? 0),
        completedAt: e?.completedAt ?? null,
      };
    });
    const expiries = u.certificates.map((c) => c.expiresAt!).filter((d) => d > now);
    return {
      id: u.id,
      name: u.name ?? u.email.split("@")[0],
      email: u.email,
      jobRole: u.jobRole,
      isOrgAdmin: u.role === "ORG_ADMIN" || u.role === "ADMIN",
      status: u.status,
      assigned,
      assignedDone: assigned.filter((a) => a.completedAt).length,
      enrolledCount: u.enrollments.length,
      completedCount: u.enrollments.filter((e) => e.completedAt).length,
      lastExpiry: expiries.length ? new Date(Math.min(...expiries.map((d) => d.getTime()))) : null,
    };
  });

  const assignedTotal = members.reduce((s, m) => s + m.assigned.length, 0);
  const assignedDone = members.reduce((s, m) => s + m.assignedDone, 0);
  const enrolledTotal = members.reduce((s, m) => s + m.enrolledCount, 0);
  const completedTotal = members.reduce((s, m) => s + m.completedCount, 0);

  // 미이수 배정: 기한 지남·임박을 앞에, 기한 없는 건 뒤에
  const pending = members
    .flatMap((m) =>
      m.assigned.filter((a) => !a.completedAt).map((a) => ({ memberId: m.id, name: m.name, jobRole: m.jobRole, ...a }))
    )
    .sort((a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity));
  const dueSoon = pending.filter((p) => p.dueAt && p.dueAt.getTime() - now.getTime() <= DUE_SOON_DAYS * DAY);

  const expiring = users
    .flatMap((u) =>
      u.certificates
        .filter((c) => c.expiresAt! > now && c.expiresAt!.getTime() - now.getTime() <= EXPIRY_SOON_DAYS * DAY)
        .map((c) => ({
          name: u.name ?? u.email.split("@")[0],
          number: c.number,
          title: c.course.title,
          expiresAt: c.expiresAt!,
        }))
    )
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  return {
    organization,
    members,
    invites,
    stats: {
      memberCount: members.filter((m) => m.status === "APPROVED").length,
      pendingMemberCount: members.filter((m) => m.status === "PENDING").length,
      adminCount: members.filter((m) => m.isOrgAdmin).length,
      assignedTotal,
      assignedDone,
      assignedRate: assignedTotal ? Math.round((assignedDone / assignedTotal) * 100) : null,
      enrolledTotal,
      completedTotal,
      completionRate: enrolledTotal ? Math.round((completedTotal / enrolledTotal) * 100) : null,
      dueSoonCount: dueSoon.length,
      pendingCount: pending.length,
      expiringCount: expiring.length,
    },
    pending,
    expiring,
  };
}

/** 과정 배정 모달용: 관리자 본인이 볼 수 있는(노출 규칙 통과) 강의 */
export async function getAssignableCourses(viewer: Viewer) {
  return prisma.course.findMany({
    where: visibleCourseWhere(viewer),
    orderBy: [{ category: { order: "asc" } }, { title: "asc" }],
    select: { id: true, title: true, category: { select: { name: true } } },
  });
}
