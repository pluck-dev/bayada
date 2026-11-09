// 홈페이지 콘텐츠 읽기 (서버 전용) — 어드민 '웹사이트' 작업 영역에서 고친 DB 값을 읽고,
// DB 가 없거나(도커 빌드는 DB 접속 없음) 못 읽거나 테이블이 비어 있으면 src/data/* 하드코딩 값을 쓴다.
// 페이지는 ISR(revalidate) + 어드민 저장 시 POST /api/revalidate 로 갱신된다.
import { cache } from "react";
import { prisma } from "@bayada/db";
import {
  WEB_BLOG_CATEGORIES,
  WEB_SETTING_DEFAULTS,
  kstDate,
  normalizeWebSetting,
} from "@bayada/shared/web-content";
import type { BlogPost, BlogCategory, FAQCategory, HeroSlide, Review, SiteInfo } from "@/types";
import { blogPosts as fallbackPosts } from "@/data/blog";
import { faqCategories as fallbackFaq } from "@/data/faq-data";
import { reviews as fallbackReviews } from "@/data/reviews";
import { heroSlides as fallbackHero } from "@/data/hero";

/** 한 번 실패하면 잠시 DB 를 건너뛴다 — 빌드 중 DB 가 죽어 있으면 페이지마다 접속 타임아웃을 기다리지 않게 */
let dbDownUntil = 0;

async function fromDb<T>(label: string, query: () => Promise<T | null>, fallback: () => T): Promise<T> {
  if (!process.env.DATABASE_URL || Date.now() < dbDownUntil) return fallback();
  try {
    const value = await query();
    return value ?? fallback();
  } catch (error) {
    dbDownUntil = Date.now() + 30_000;
    console.warn(`[web-content] ${label}: DB 읽기 실패 — 기본 데이터 사용`, error instanceof Error ? error.message.split("\n")[0] : error);
    return fallback();
  }
}

export const blogCategories: { slug: BlogCategory; name: string }[] = WEB_BLOG_CATEGORIES.map((c) => ({ ...c }));

const byPublishedDesc = (a: BlogPost, b: BlogPost) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/** 게시·초안 전부 (상세 페이지가 초안을 404 로 거른다) */
export const getAllPosts = cache(async (): Promise<BlogPost[]> =>
  fromDb(
    "blog",
    async () => {
      const rows = await prisma.webBlogPost.findMany({ orderBy: { publishedAt: "desc" } });
      if (rows.length === 0) return null;
      return rows.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category as BlogCategory,
        image: p.coverImage ?? "",
        author: p.author,
        publishedAt: kstDate(p.publishedAt),
        readTime: p.readTime,
        isPublished: p.isPublished,
        tags: p.tags,
        content: p.body,
      }));
    },
    // 기본 데이터의 image 는 실제 파일이 없는 자리표시 경로(/images/blog/…)라 표지 없이 둔다(원래 화면도 회색 상자)
    () => fallbackPosts.map((p) => ({ ...p, image: "" })),
  ),
);

export async function getPublishedPosts(): Promise<BlogPost[]> {
  return (await getAllPosts()).filter((p) => p.isPublished).sort(byPublishedDesc);
}

export async function getLatestPosts(count = 3): Promise<BlogPost[]> {
  return (await getPublishedPosts()).slice(0, count);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

export const getFaqCategories = cache(async (): Promise<FAQCategory[]> =>
  fromDb(
    "faq",
    async () => {
      const rows = await prisma.webFaqCategory.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { items: { where: { visible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
      });
      if (rows.length === 0) return null;
      return rows
        .map((c) => ({ slug: c.slug, name: c.name, items: c.items.map((i) => ({ q: i.question, a: i.answer })) }))
        .filter((c) => c.items.length > 0);
    },
    () => fallbackFaq,
  ),
);

export const getReviews = cache(async (): Promise<Review[]> =>
  fromDb(
    "reviews",
    async () => {
      // 숨긴 후기까지 세어 '행이 하나도 없음'(가져오기 전)과 '전부 숨김'을 구분한다
      const rows = await prisma.webReview.findMany({ orderBy: [{ order: "asc" }, { reviewedAt: "desc" }] });
      if (rows.length === 0) return null;
      return rows
        .filter((r) => r.visible)
        .map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          author: r.author,
          serviceType: r.serviceType,
          createdAt: kstDate(r.reviewedAt),
        }));
    },
    () => fallbackReviews,
  ),
);

export function averageRating(list: Review[]): number {
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / list.length) * 10) / 10;
}

export const getHeroSlides = cache(async (): Promise<HeroSlide[]> =>
  fromDb(
    "hero",
    async () => {
      const rows = await prisma.webHeroSlide.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
      const visible = rows.filter((r) => r.visible);
      // 슬라이드가 0장이면 히어로가 빈 화면이 되므로 기본 슬라이드를 쓴다
      if (visible.length === 0) return null;
      return visible.map((r) => ({
        id: r.id,
        src: r.imageUrl,
        alt: r.alt,
        title: r.title,
        subtitle: r.subtitle,
        ctaLabel: r.ctaLabel,
        ctaHref: r.ctaHref,
      }));
    },
    () => fallbackHero,
  ),
);

export const getSiteInfo = cache(async (): Promise<SiteInfo> =>
  fromDb(
    "site",
    async () => {
      const row = await prisma.siteSetting.findUnique({ where: { key: "web.site" } });
      return row ? normalizeWebSetting("web.site", row.value) : null;
    },
    () => WEB_SETTING_DEFAULTS["web.site"],
  ),
);
