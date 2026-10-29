import { prisma } from "@bayada/db";
import type { JobRole, LearningMode, Level, Prisma, ProductType } from "@bayada/db";
import type { Viewer } from "@/lib/viewer";
import {
  CERT_KINDS,
  JOB_ROLES,
  LEARNING_MODES,
  LEVELS,
  PRICE_KINDS,
  PRODUCT_TYPES,
  type CertKind,
  type PriceKind,
} from "@/lib/labels";

/**
 * 노출 규칙 (모든 목록·상세에 서버에서 적용)
 * - PUBLISHED + PUBLIC   → 누구나
 * - PUBLISHED + INTERNAL → 사내 조직(isInternal) 소속 로그인 사용자만
 * - 그 외 상태(ARCHIVED 등)는 카탈로그에 절대 노출하지 않는다
 */
export function visibleCourseWhere(viewer: Viewer | null): Prisma.CourseWhereInput {
  return {
    status: "PUBLISHED",
    ...(viewer?.isInternal ? {} : { visibility: "PUBLIC" }),
  };
}

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  thumbnail: true,
  price: true,
  productType: true,
  level: true,
  learningMode: true,
  durationMin: true,
  audiences: true,
  visibility: true,
  category: { select: { name: true, slug: true } },
  provider: { select: { name: true } },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect;

type CourseCardRow = Prisma.CourseGetPayload<{ select: typeof cardSelect }>;

/** 카드 데이터 + 공개 후기 평점(1건 이상일 때만) + 찜 여부(비로그인은 null) */
export type CourseCardData = CourseCardRow & {
  rating: { avg: number; count: number } | null;
  wished: boolean | null;
};

/** 카드 목록에 평점·찜 여부를 붙인다 (쿼리 2번으로 묶어서) */
export async function withCardExtras(rows: CourseCardRow[], viewer: Viewer | null): Promise<CourseCardData[]> {
  const ids = [...new Set(rows.map((r) => r.id))];
  if (ids.length === 0) return [];
  const [ratings, wishes] = await Promise.all([
    prisma.review.groupBy({
      by: ["courseId"],
      where: { courseId: { in: ids }, status: "PUBLISHED" },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    viewer
      ? prisma.wishlist.findMany({ where: { userId: viewer.id, courseId: { in: ids } }, select: { courseId: true } })
      : Promise.resolve(null),
  ]);
  const ratingBy = new Map(ratings.map((r) => [r.courseId, { avg: r._avg.rating ?? 0, count: r._count._all }]));
  const wished = wishes ? new Set(wishes.map((w) => w.courseId)) : null;
  return rows.map((r) => ({
    ...r,
    rating: ratingBy.get(r.id) ?? null,
    wished: wished ? wished.has(r.id) : null,
  }));
}

// ─── 카탈로그 ───

export type CatalogSort = "recommended" | "popular" | "newest";

export interface CatalogFilters {
  q: string;
  audience: JobRole[];
  type: ProductType[];
  level: Level[];
  category: string[];
  provider: string[];
  mode: LearningMode[];
  price: PriceKind[];
  cert: CertKind[];
  sort: CatalogSort;
  page: number;
}

function pickList<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]): T[] {
  const values = (Array.isArray(raw) ? raw : raw ? [raw] : []).flatMap((v) => v.split(","));
  return allowed.filter((a) => values.includes(a));
}

function rawList(raw: string | string[] | undefined): string[] {
  return (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseCatalogFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort: CatalogSort =
    sortRaw === "popular" || sortRaw === "newest" ? sortRaw : "recommended";
  const pageRaw = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page);
  return {
    q: q.slice(0, 80),
    audience: pickList(sp.audience, JOB_ROLES),
    type: pickList(sp.type, PRODUCT_TYPES),
    level: pickList(sp.level, LEVELS),
    category: rawList(sp.category),
    provider: rawList(sp.provider),
    mode: pickList(sp.mode, LEARNING_MODES),
    price: pickList(sp.price, PRICE_KINDS),
    cert: pickList(sp.cert, CERT_KINDS),
    sort,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };
}

export const CATALOG_PAGE_SIZE = 12;

export async function listCatalog(viewer: Viewer | null, f: CatalogFilters) {
  const and: Prisma.CourseWhereInput[] = [visibleCourseWhere(viewer)];
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { summary: { contains: f.q, mode: "insensitive" } },
        { category: { name: { contains: f.q, mode: "insensitive" } } },
        { provider: { name: { contains: f.q, mode: "insensitive" } } },
      ],
    });
  }
  if (f.audience.length) and.push({ audiences: { hasSome: f.audience } });
  if (f.type.length) and.push({ productType: { in: f.type } });
  if (f.level.length) and.push({ level: { in: f.level } });
  if (f.category.length) and.push({ category: { slug: { in: f.category } } });
  if (f.provider.length) and.push({ provider: { slug: { in: f.provider } } });
  if (f.mode.length) and.push({ learningMode: { in: f.mode } });
  // 둘 다 고르면 조건 없음과 같다
  if (f.price.length === 1) and.push(f.price[0] === "free" ? { price: 0 } : { price: { gt: 0 } });
  if (f.cert.length === 1)
    and.push(f.cert[0] === "BAYADA" ? { productType: "CERTIFICATION" } : { productType: { not: "CERTIFICATION" } });
  const where: Prisma.CourseWhereInput = { AND: and };

  const orderBy: Prisma.CourseOrderByWithRelationInput[] =
    f.sort === "popular"
      ? [{ enrollments: { _count: "desc" } }, { publishedAt: "desc" }]
      : f.sort === "newest"
        ? [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
        : [{ featured: "desc" }, { enrollments: { _count: "desc" } }, { publishedAt: "desc" }];

  const total = await prisma.course.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(f.page, totalPages);
  const rows = await prisma.course.findMany({
    where,
    orderBy,
    select: cardSelect,
    skip: (page - 1) * CATALOG_PAGE_SIZE,
    take: CATALOG_PAGE_SIZE,
  });
  return { items: await withCardExtras(rows, viewer), total, page, totalPages };
}

/** 필터 패널·메가메뉴용 분류 목록 (노출 가능한 강의 수 포함) */
export async function getTaxonomy(viewer: Viewer | null) {
  const visible = visibleCourseWhere(viewer);
  const [categories, providers] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { courses: { where: visible } } },
      },
    }),
    prisma.provider.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true, _count: { select: { courses: { where: visible } } } },
    }),
  ]);
  return {
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.courses })),
    providers: providers.map((p) => ({ name: p.name, slug: p.slug, count: p._count.courses })),
  };
}

export type Taxonomy = Awaited<ReturnType<typeof getTaxonomy>>;

/** 카탈로그 필터 옵션별 강의 수 (학습 방식·가격·인증 유형) */
export async function getFacetCounts(viewer: Viewer | null) {
  const visible = visibleCourseWhere(viewer);
  const [modes, free, paid, bayada, total] = await Promise.all([
    prisma.course.groupBy({ by: ["learningMode"], where: visible, _count: { _all: true } }),
    prisma.course.count({ where: { ...visible, price: 0 } }),
    prisma.course.count({ where: { ...visible, price: { gt: 0 } } }),
    prisma.course.count({ where: { ...visible, productType: "CERTIFICATION" } }),
    prisma.course.count({ where: visible }),
  ]);
  return {
    mode: Object.fromEntries(modes.map((m) => [m.learningMode, m._count._all])) as Partial<Record<LearningMode, number>>,
    price: { free, paid } as Record<PriceKind, number>,
    cert: { BAYADA: bayada, COMPLETION: total - bayada } as Record<CertKind, number>,
  };
}

// ─── 홈 ───

export async function getHomeData(viewer: Viewer | null) {
  const visible = visibleCourseWhere(viewer);
  const now = new Date();

  const [banners, popularRows, newestRows, certificationRows, roleEntries] = await Promise.all([
    prisma.banner.findMany({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: [{ order: "asc" }, { startsAt: "desc" }],
      take: 5,
    }),
    prisma.course.findMany({
      where: visible,
      orderBy: [{ enrollments: { _count: "desc" } }, { publishedAt: "desc" }],
      select: cardSelect,
      take: 8,
    }),
    prisma.course.findMany({
      where: visible,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      select: cardSelect,
      take: 8,
    }),
    prisma.course.findMany({
      where: { ...visible, productType: "CERTIFICATION" },
      orderBy: [{ enrollments: { _count: "desc" } }],
      select: cardSelect,
      take: 8,
    }),
    Promise.all(
      JOB_ROLES.map(async (role) => {
        const items = await prisma.course.findMany({
          where: { ...visible, audiences: { has: role } },
          orderBy: [{ featured: "desc" }, { enrollments: { _count: "desc" } }],
          select: cardSelect,
          take: 4,
        });
        return [role, items] as const;
      })
    ),
  ]);

  // 평점·찜 여부를 한 번에 붙이고 다시 나눈다
  const all = await withCardExtras(
    [...popularRows, ...newestRows, ...certificationRows, ...roleEntries.flatMap(([, items]) => items)],
    viewer
  );
  const byId = new Map(all.map((c) => [c.id, c]));
  const pick = (rows: CourseCardRow[]) => rows.map((r) => byId.get(r.id)!);
  const popular = pick(popularRows);
  const newest = pick(newestRows);
  const certification = pick(certificationRows);

  // 해당 직군 대상 강의가 없으면 전체 인기 강의로 대체
  const byRole = Object.fromEntries(
    roleEntries.map(([role, items]) => [
      role,
      { items: items.length ? pick(items) : popular.slice(0, 4), fallback: items.length === 0 },
    ])
  ) as Record<JobRole, { items: CourseCardData[]; fallback: boolean }>;

  return { banners, popular, newest, certification, byRole };
}

// ─── 상세 ───

export async function getCourseForDetail(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      provider: { select: { name: true, slug: true, logo: true, isPartner: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lectures: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              isFree: true,
              quiz: { select: { passingScore: true, _count: { select: { questions: true } } } },
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseForDetail>>>;

export type CourseAccess =
  | { kind: "ok"; enrollment: { id: string; progressPercent: number; completedAt: Date | null } | null }
  | { kind: "login" } // 사내 전용 — 로그인하면 볼 수 있을 수도
  | { kind: "notfound" };

/**
 * 상세·강의실 접근 판정.
 * 수강 중인 사용자는 강의가 보관(ARCHIVED)되거나 사내 전용으로 바뀌어도 계속 들을 수 있다.
 */
export async function resolveCourseAccess(
  course: { id: string; status: string; visibility: string },
  viewer: Viewer | null
): Promise<CourseAccess> {
  const enrollment = viewer
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
        select: { id: true, progressPercent: true, completedAt: true },
      })
    : null;
  if (enrollment) return { kind: "ok", enrollment };
  if (course.status !== "PUBLISHED") return { kind: "notfound" };
  if (course.visibility === "PUBLIC") return { kind: "ok", enrollment: null };
  if (viewer?.isInternal) return { kind: "ok", enrollment: null };
  return viewer ? { kind: "notfound" } : { kind: "login" };
}

/** 노출 가능한 강의인지 (수강 신청 가능 여부) */
export function isCourseListed(
  course: { status: string; visibility: string },
  viewer: Viewer | null
): boolean {
  if (course.status !== "PUBLISHED") return false;
  return course.visibility === "PUBLIC" || !!viewer?.isInternal;
}
