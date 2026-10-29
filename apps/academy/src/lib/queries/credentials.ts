import { prisma } from "@bayada/db";
import type { Viewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";
import { OPEN_APP_STATUSES, credentialState } from "@/lib/credentials";

const programSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  requiredCourseIds: true,
  examPassingScore: true,
  practicalRequired: true,
  practicalPassingScore: true,
  validityMonths: true,
  renewalNoticeDays: true,
  criteria: true,
} as const;

/**
 * 선수 프로그램 목록 + 보는 사람의 이수 상태.
 * 볼 수 없는 강의(사내 전용·비게시)는 존재를 숨긴다 — 제목 대신 안내 문구, 링크 없음. 수강 기록이 있으면 본인 것이니 보여 준다.
 */
async function prerequisitesFor(courseIds: string[], viewer: Viewer | null) {
  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, slug: true, title: true, status: true, visibility: true, durationMin: true },
    }),
    viewer
      ? prisma.enrollment.findMany({
          where: { userId: viewer.id, courseId: { in: courseIds } },
          select: { courseId: true, progressPercent: true, completedAt: true },
        })
      : Promise.resolve([]),
  ]);
  const byId = new Map(courses.map((c) => [c.id, c]));
  const enr = new Map(enrollments.map((e) => [e.courseId, e]));
  return courseIds.map((id) => {
    const c = byId.get(id);
    const e = enr.get(id);
    const visible = !!c && (isCourseListed(c, viewer) || !!e);
    return {
      courseId: id,
      title: visible ? c!.title : null,
      slug: visible ? c!.slug : null,
      durationMin: visible ? c!.durationMin : null,
      enrolled: !!e,
      progressPercent: e ? (e.completedAt ? 100 : e.progressPercent) : 0,
      completedAt: e?.completedAt ?? null,
    };
  });
}

export type Prerequisite = Awaited<ReturnType<typeof prerequisitesFor>>[number];

export async function listActivePrograms(viewer: Viewer | null) {
  const programs = await prisma.credentialProgram.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    select: { ...programSelect, _count: { select: { credentials: { where: { revokedAt: null } } } } },
  });
  return Promise.all(
    programs.map(async (p) => {
      const prerequisites = await prerequisitesFor(p.requiredCourseIds, viewer);
      return { ...p, prerequisites, done: prerequisites.filter((r) => r.completedAt).length };
    }),
  );
}

/** 상세 — 비공개 과정은 404 (단, 이미 신청·취득한 본인은 계속 볼 수 있게 소유 여부를 같이 본다) */
export async function getProgramDetail(slug: string, viewer: Viewer | null) {
  const p = await prisma.credentialProgram.findUnique({ where: { slug }, select: { ...programSelect, active: true } });
  if (!p) return null;
  const [prerequisites, applications, credentials] = await Promise.all([
    prerequisitesFor(p.requiredCourseIds, viewer),
    viewer
      ? prisma.credentialApplication.findMany({
          where: { userId: viewer.id, programId: p.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, createdAt: true, decidedAt: true, decisionNote: true },
        })
      : Promise.resolve([]),
    viewer
      ? prisma.credential.findMany({
          where: { userId: viewer.id, programId: p.id },
          orderBy: { issuedAt: "desc" },
          select: { number: true, issuedAt: true, expiresAt: true, revokedAt: true },
        })
      : Promise.resolve([]),
  ]);
  if (!p.active && applications.length === 0 && credentials.length === 0) return null;
  return { program: p, prerequisites, applications, credentials, eligibility: eligibility(p, prerequisites, applications, credentials) };
}

type Eligibility =
  | { ok: true; renewal: boolean }
  | { ok: false; reason: "inactive" | "prerequisites" | "open" | "held" };

/**
 * 신청 가능 여부 (화면과 신청 API 가 같은 규칙을 쓴다)
 * - 선수 프로그램 전부 수료 · 진행 중인 신청 없음
 * - 이미 유효한 인증이 있으면 갱신 알림 기간에 들어왔을 때만 (재취득 = 갱신)
 */
export function eligibility(
  p: { active: boolean; renewalNoticeDays: number },
  prerequisites: { completedAt: Date | null }[],
  applications: { status: string }[],
  credentials: { expiresAt: Date | null; revokedAt: Date | null }[],
): Eligibility {
  if (!p.active) return { ok: false, reason: "inactive" };
  if (applications.some((a) => (OPEN_APP_STATUSES as string[]).includes(a.status))) return { ok: false, reason: "open" };
  const states = credentials.map((c) => credentialState(c, p.renewalNoticeDays));
  if (states.includes("valid")) return { ok: false, reason: "held" };
  if (prerequisites.some((r) => !r.completedAt)) return { ok: false, reason: "prerequisites" };
  return { ok: true, renewal: states.includes("expiring") };
}

/** 신청 API 용 — 트랜잭션 밖에서 미리 판정 (트랜잭션 안에서 다시 확인) */
export async function loadEligibility(programId: string, userId: string, viewer: Viewer) {
  const p = await prisma.credentialProgram.findUnique({
    where: { id: programId },
    select: { id: true, active: true, renewalNoticeDays: true, requiredCourseIds: true },
  });
  if (!p) return null;
  const [prerequisites, applications, credentials] = await Promise.all([
    prerequisitesFor(p.requiredCourseIds, viewer),
    prisma.credentialApplication.findMany({ where: { userId, programId }, select: { status: true } }),
    prisma.credential.findMany({ where: { userId, programId }, select: { expiresAt: true, revokedAt: true } }),
  ]);
  return { program: p, result: eligibility(p, prerequisites, applications, credentials) };
}

// ─── 마이 러닝 · 인증서 지갑 ───

export async function getMyCredentials(userId: string) {
  return prisma.credential.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      number: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      renewalNotifiedAt: true,
      program: { select: { slug: true, title: true, validityMonths: true, renewalNoticeDays: true, active: true } },
    },
  });
}

export async function getMyApplications(userId: string) {
  return prisma.credentialApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      decidedAt: true,
      decisionNote: true,
      program: { select: { slug: true, title: true } },
    },
  });
}

/**
 * 갱신 알림 (메일 인프라가 없어 화면 안 배너로 대신한다).
 * 알림 기간에 들어온 유효 인증을 돌려주고, 처음 보여 준 시각을 renewalNotifiedAt 에 남긴다 → 어드민 '발급된 인증'에서 누가 알림을 봤는지 확인.
 */
export async function takeRenewalNotices(userId: string) {
  const now = new Date();
  const rows = await prisma.credential.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: now } },
    select: {
      id: true,
      number: true,
      expiresAt: true,
      revokedAt: true,
      renewalNotifiedAt: true,
      program: { select: { slug: true, title: true, renewalNoticeDays: true } },
    },
    orderBy: { expiresAt: "asc" },
  });
  const due = rows.filter((c) => credentialState(c, c.program.renewalNoticeDays, now) === "expiring");
  const first = due.filter((c) => !c.renewalNotifiedAt).map((c) => c.id);
  if (first.length) {
    await prisma.credential.updateMany({ where: { id: { in: first }, renewalNotifiedAt: null }, data: { renewalNotifiedAt: now } });
  }
  return due;
}

// ─── 출력 · 공개 검증 ───

export async function getCredentialByNumber(number: string) {
  return prisma.credential.findUnique({
    where: { number },
    select: {
      number: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      userId: true,
      user: { select: { name: true, email: true } },
      program: { select: { slug: true, title: true, validityMonths: true, renewalNoticeDays: true, practicalRequired: true } },
    },
  });
}

/** 강의 상세 '수료 안내' — 이 강의가 선수 과정인 공개 인증 */
export async function programsRequiringCourse(courseId: string) {
  return prisma.credentialProgram.findMany({
    where: { active: true, requiredCourseIds: { has: courseId } },
    select: { slug: true, title: true },
    orderBy: { createdAt: "asc" },
  });
}
