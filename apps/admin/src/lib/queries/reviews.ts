import { prisma, type Prisma } from "@bayada/db";

/**
 * 미처리 신고 — 게시 중인데 신고가 쌓인 후기.
 * 숨기면 처리 완료, 다시 게시·신고 기각하면 reportCount 를 0 으로 돌려 목록에서 빠진다.
 */
export const OPEN_REPORT_WHERE: Prisma.ReviewWhereInput = { status: "PUBLISHED", reportCount: { gt: 0 } };

export const REVIEW_PAGE_SIZE = 50;

export type ReviewFilter = "reported" | "hidden" | undefined;

export async function listReviews(filter: ReviewFilter, page: number) {
  const where: Prisma.ReviewWhereInput =
    filter === "reported" ? OPEN_REPORT_WHERE : filter === "hidden" ? { status: "HIDDEN" } : {};
  const [rows, total, all, reported, hidden] = await Promise.all([
    prisma.review.findMany({
      where,
      // 신고 많은 순 → 최신 순
      orderBy: [{ reportCount: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
      select: {
        id: true,
        rating: true,
        content: true,
        status: true,
        reportCount: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.count(),
    prisma.review.count({ where: OPEN_REPORT_WHERE }),
    prisma.review.count({ where: { status: "HIDDEN" } }),
  ]);
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE)),
    counts: { all, reported, hidden },
  };
}

/** 홍길동 → 홍*동, 김철 → 김*, 이름이 없으면 이메일 앞부분을 가린다 */
export function maskName(name: string | null, email: string): string {
  const n = name?.trim();
  if (n) {
    if (n.length <= 1) return "*";
    if (n.length === 2) return `${n[0]}*`;
    return `${n[0]}${"*".repeat(n.length - 2)}${n[n.length - 1]}`;
  }
  const local = email.split("@")[0];
  return `${local.slice(0, 2)}${"*".repeat(Math.max(1, local.length - 2))}`;
}
