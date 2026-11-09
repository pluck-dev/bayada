import { prisma } from "@bayada/db";
import type { JobRole, Prisma } from "@bayada/db";
import type { Viewer } from "@/lib/viewer";
import { maskName } from "@/lib/params";
import { browsableCourseWhere, cardSelect, withCardExtras } from "@/lib/queries/courses";

// ─── 후기·평점 ───

/** 후기 작성 기준: 진도 80% 이상 또는 수료 */
export const REVIEW_MIN_PROGRESS = 80;

export function canWriteReview(enrollment: { progressPercent: number; completedAt: Date | null } | null): boolean {
  return !!enrollment && (!!enrollment.completedAt || enrollment.progressPercent >= REVIEW_MIN_PROGRESS);
}

const reviewSelect = {
  id: true,
  rating: true,
  content: true,
  showName: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  user: { select: { name: true, jobRole: true } },
} satisfies Prisma.ReviewSelect;

type ReviewRow = Prisma.ReviewGetPayload<{ select: typeof reviewSelect }>;

export interface ReviewCardData {
  id: string;
  rating: number;
  content: string;
  author: string;
  jobRole: JobRole | null;
  createdAt: Date;
  edited: boolean;
  mine: boolean;
}

function toCard(r: ReviewRow, viewerId: string | null): ReviewCardData {
  return {
    id: r.id,
    rating: r.rating,
    content: r.content,
    // 실명 노출에 동의한 후기만 이름 전체, 나머지는 가운데 글자를 가린다
    author: r.showName && r.user.name ? r.user.name : maskName(r.user.name),
    jobRole: r.user.jobRole,
    createdAt: r.createdAt,
    edited: r.updatedAt.getTime() - r.createdAt.getTime() > 60_000,
    mine: r.userId === viewerId,
  };
}

/** 상세 페이지 후기: 공개 후기 요약(평균·분포) + 목록 + 내 후기(숨김 상태 포함) */
export async function getCourseReviews(courseId: string, viewerId: string | null) {
  const [rows, mine] = await Promise.all([
    prisma.review.findMany({
      where: { courseId, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: reviewSelect,
    }),
    viewerId
      ? prisma.review.findUnique({
          where: { userId_courseId: { userId: viewerId, courseId } },
          select: { id: true, rating: true, content: true, showName: true, status: true },
        })
      : Promise.resolve(null),
  ]);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: rows.filter((r) => r.rating === star).length }));
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
  const reported =
    viewerId && rows.length
      ? new Set(
          (
            await prisma.auditLog.findMany({
              where: { actorId: viewerId, action: "review.report", target: { in: rows.map((r) => `Review:${r.id}`) } },
              select: { target: true },
            })
          ).map((a) => a.target.slice("Review:".length))
        )
      : new Set<string>();
  return {
    summary: { count: rows.length, avg, distribution },
    reviews: rows.map((r) => ({ ...toCard(r, viewerId), reported: reported.has(r.id) })),
    mine,
  };
}

/** 홈 ⑩ 최근 후기 — 보는 사람이 볼 수 있는 강의의 공개 후기만 */
export async function getRecentReviews(viewer: Viewer | null, take = 9) {
  const rows = await prisma.review.findMany({
    where: { status: "PUBLISHED", course: browsableCourseWhere() },
    orderBy: { createdAt: "desc" },
    take,
    select: { ...reviewSelect, course: { select: { slug: true, title: true } } },
  });
  return rows.map((r) => ({ ...toCard(r, viewer?.id ?? null), course: r.course }));
}

// ─── 홈 ⑥ 파트너 · ⑨ 성과 지표 ───

export async function getPartners() {
  return prisma.provider.findMany({
    where: { isPartner: true, logo: { not: null } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, logo: true },
  });
}

export async function getImpactStats(viewer: Viewer | null) {
  const [graduates, certificates, organizations, programs] = await Promise.all([
    prisma.certificate.groupBy({ by: ["userId"] }).then((g) => g.length),
    prisma.certificate.count(),
    prisma.organization.count({ where: { users: { some: {} } } }),
    prisma.course.count({ where: browsableCourseWhere() }),
  ]);
  return [
    { label: "수료자", value: graduates, unit: "명" },
    { label: "발급 수료증", value: certificates, unit: "건" },
    { label: "참여 기관", value: organizations, unit: "곳" },
    { label: "개설 프로그램", value: programs, unit: "개" },
  ].filter((s) => s.value > 0);
}

// ─── 실습 일정 ───

/** 상세 페이지: 아직 끝나지 않은 일정 + 남은 자리 + 내 신청 여부 */
export async function getCourseSessions(courseId: string, viewerId: string | null) {
  const sessions = await prisma.trainingSession.findMany({
    where: { courseId, endsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      region: true,
      location: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      note: true,
      _count: { select: { registrations: true } },
      registrations: viewerId ? { where: { userId: viewerId }, select: { userId: true } } : false,
    },
  });
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    region: s.region,
    location: s.location,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    capacity: s.capacity,
    note: s.note,
    remaining: Math.max(0, s.capacity - s._count.registrations),
    registered: Array.isArray(s.registrations) && s.registrations.length > 0,
  }));
}

export async function getMySessions(userId: string) {
  const rows = await prisma.sessionRegistration.findMany({
    where: { userId },
    orderBy: { session: { startsAt: "asc" } },
    select: {
      createdAt: true,
      session: {
        select: {
          id: true,
          title: true,
          region: true,
          location: true,
          startsAt: true,
          endsAt: true,
          course: { select: { slug: true, title: true } },
        },
      },
    },
  });
  return rows.map((r) => ({ registeredAt: r.createdAt, ...r.session }));
}

// ─── 찜 ───

export async function getMyWishlist(viewer: Viewer) {
  const rows = await prisma.wishlist.findMany({
    where: { userId: viewer.id },
    orderBy: { createdAt: "desc" },
    select: {
      course: { select: { ...cardSelect, status: true } },
    },
  });
  // 찜한 뒤 비공개·보관된 강의는 목록에서 뺀다 (수강 중인 강의는 마이 러닝에 남아 있다)
  const listed = rows
    .map((r) => r.course)
    .filter((c) => c.status === "PUBLISHED" && (c.visibility === "PUBLIC" || viewer.isInternal))
    .map(({ status: _status, ...c }) => c);
  return withCardExtras(listed, viewer);
}
