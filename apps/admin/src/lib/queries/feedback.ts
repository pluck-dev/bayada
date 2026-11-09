// 클라이언트 리뷰 피드백 (웹사이트·아카데미 공용 테이블) — 목록·현황·상세 조회
import { prisma, type Prisma, type ReviewFeedbackStatus, type ReviewSite } from "@bayada/db";
import {
  feedbackHash,
  feedbackKinds,
  feedbackStatusKeys,
  isFeedbackKind,
  isFeedbackStatus,
  isPagePath,
  isReviewSite,
  isSectionValue,
  type FeedbackStatus,
  type ReviewSiteKey,
} from "@bayada/review/config";

export const FEEDBACK_PAGE_SIZE = 30;

/** 개발완료 이상 = 처리됨으로 센다 (원본 대시보드 기준) */
export const HANDLED_STATUSES: FeedbackStatus[] = ["developed", "deployed", "resolved"];

export interface FeedbackFilter {
  site: ReviewSiteKey | "";
  status: FeedbackStatus | "";
  kind: string;
  department: "client" | "agency" | "none" | "";
  section: string;
  q: string;
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseFeedbackFilter(sp: Params): FeedbackFilter {
  const site = one(sp.site);
  const status = one(sp.status);
  const kind = one(sp.kind);
  const department = one(sp.department);
  const section = one(sp.section);
  return {
    site: isReviewSite(site) ? site : "",
    status: isFeedbackStatus(status) ? status : "",
    kind: isFeedbackKind(kind) ? kind : "",
    department: department === "client" || department === "agency" || department === "none" ? department : "",
    // 화면 영역은 사이트를 고른 뒤에만 의미가 있다 (사이트마다 영역 이름이 다름)
    section: isReviewSite(site) && isSectionValue(section) ? section : "",
    q: one(sp.q).trim().slice(0, 100),
  };
}

/** 필터 → where. 상태는 따로 넘겨 탭별 개수를 같은 조건으로 셀 수 있게 한다 */
export function feedbackWhere(f: FeedbackFilter, withStatus = true): Prisma.ReviewFeedbackWhereInput {
  const idMatch = /^#?(\d{1,9})$/.exec(f.q);
  return {
    deletedAt: null,
    ...(f.site ? { site: f.site as ReviewSite } : {}),
    ...(withStatus && f.status ? { status: f.status as ReviewFeedbackStatus } : {}),
    ...(f.kind ? { kind: f.kind as Prisma.ReviewFeedbackWhereInput["kind"] } : {}),
    ...(f.department === "none" ? { department: null } : f.department ? { department: f.department } : {}),
    ...(f.section ? { section: f.section } : {}),
    ...(idMatch
      ? { id: Number(idMatch[1]) }
      : f.q
        ? {
            OR: [
              { body: { contains: f.q, mode: "insensitive" as const } },
              { pagePath: { contains: f.q, mode: "insensitive" as const } },
              { assignee: { contains: f.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
  };
}

export const feedbackListSelect = {
  id: true,
  site: true,
  kind: true,
  status: true,
  department: true,
  assignee: true,
  tags: true,
  body: true,
  pagePath: true,
  section: true,
  createdAt: true,
  reworkRequestedAt: true,
  _count: { select: { replies: { where: { deletedAt: null } } } },
} satisfies Prisma.ReviewFeedbackSelect;

export type FeedbackListRow = Prisma.ReviewFeedbackGetPayload<{ select: typeof feedbackListSelect }>;

export async function listFeedback(f: FeedbackFilter, page: number) {
  const where = feedbackWhere(f);
  const statusBase = feedbackWhere(f, false);
  const [total, rows, byStatus] = await Promise.all([
    prisma.reviewFeedback.count({ where }),
    prisma.reviewFeedback.findMany({
      where,
      select: feedbackListSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
    }),
    prisma.reviewFeedback.groupBy({ by: ["status"], where: statusBase, _count: { _all: true } }),
  ]);
  const statusCounts = Object.fromEntries(feedbackStatusKeys.map((s) => [s, 0])) as Record<FeedbackStatus, number>;
  for (const g of byStatus) statusCounts[g.status as FeedbackStatus] = g._count._all;
  const all = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / FEEDBACK_PAGE_SIZE)), statusCounts, all };
}

/**
 * 상단 현황 — 사이트 필터만 적용한 전체 기준.
 * 처리율(개발완료 이상), 미처리 유형별, 최근 7일 신규, 재수정 요청, 화면 영역별 처리 현황.
 */
export async function feedbackSummary(site: ReviewSiteKey | "") {
  const base: Prisma.ReviewFeedbackWhereInput = { deletedAt: null, ...(site ? { site: site as ReviewSite } : {}) };
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600_000);
  const [bySiteStatus, openByKind, recent, rework, bySection] = await Promise.all([
    prisma.reviewFeedback.groupBy({ by: ["site", "status"], where: base, _count: { _all: true } }),
    prisma.reviewFeedback.groupBy({ by: ["kind"], where: { ...base, status: "open" }, _count: { _all: true } }),
    prisma.reviewFeedback.count({ where: { ...base, createdAt: { gte: weekAgo } } }),
    prisma.reviewFeedback.count({ where: { ...base, reworkRequestedAt: { not: null }, status: { not: "resolved" } } }),
    prisma.reviewFeedback.groupBy({ by: ["site", "section", "status"], where: base, _count: { _all: true } }),
  ]);
  const total = bySiteStatus.reduce((a, g) => a + g._count._all, 0);
  const handled = bySiteStatus.filter((g) => HANDLED_STATUSES.includes(g.status as FeedbackStatus)).reduce((a, g) => a + g._count._all, 0);
  const open = bySiteStatus.filter((g) => g.status === "open").reduce((a, g) => a + g._count._all, 0);
  const perSite = (["web", "academy"] as const).map((key) => {
    const groups = bySiteStatus.filter((g) => g.site === key);
    return {
      site: key,
      total: groups.reduce((a, g) => a + g._count._all, 0),
      open: groups.filter((g) => g.status === "open").reduce((a, g) => a + g._count._all, 0),
    };
  });
  const sectionMap = new Map<string, { site: ReviewSiteKey; section: string; total: number; handled: number; open: number }>();
  for (const g of bySection) {
    const key = `${g.site}:${g.section}`;
    const row = sectionMap.get(key) ?? { site: g.site as ReviewSiteKey, section: g.section, total: 0, handled: 0, open: 0 };
    row.total += g._count._all;
    if (HANDLED_STATUSES.includes(g.status as FeedbackStatus)) row.handled += g._count._all;
    if (g.status === "open") row.open += g._count._all;
    sectionMap.set(key, row);
  }
  const sections = [...sectionMap.values()].sort((a, b) => b.open - a.open || b.total - a.total);
  const kinds = feedbackKinds.map((k) => ({ ...k, open: openByKind.find((g) => g.kind === k.value)?._count._all ?? 0 }));
  return { total, handled, open, recent, rework, perSite, sections, kinds };
}

export async function getFeedback(id: number) {
  return prisma.reviewFeedback.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      site: true,
      kind: true,
      status: true,
      department: true,
      assignee: true,
      tags: true,
      body: true,
      pagePath: true,
      section: true,
      context: true,
      reworkReason: true,
      reworkRequestedAt: true,
      editVersion: true,
      createdAt: true,
      updatedAt: true,
      replies: {
        where: { deletedAt: null },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 500,
        select: { id: true, parentId: true, authorName: true, department: true, body: true, createdAt: true },
      },
    },
  });
}

export function feedbackContext(value: unknown): Record<string, string | number> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, string | number>) : {};
}

/** 사이트 주소 (운영: WEB_URL·ACADEMY_URL). 없으면 null — "위치 보기" 대신 안내를 띄운다 */
export function siteBaseUrl(site: ReviewSiteKey): string | null {
  const raw = site === "web" ? process.env.WEB_URL : process.env.ACADEMY_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

/** "위치 보기" 링크 — 저장된 화면 경로 + 요소 해시(#feedback=…&review=id). 사이트의 리뷰 도구가 요소를 찾아 강조한다 */
export function feedbackLocationUrl(site: ReviewSiteKey, pagePath: string, context: Record<string, string | number>, id: number): string | null {
  const base = siteBaseUrl(site);
  if (!base || !isPagePath(pagePath)) return null;
  const url = new URL(pagePath.split("#")[0]!, base);
  url.hash = feedbackHash(context, id, { scope: "page" });
  return url.href;
}
