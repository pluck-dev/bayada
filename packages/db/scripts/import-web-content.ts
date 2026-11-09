/**
 * 홈페이지(apps/web) 하드코딩 콘텐츠 → DB. 블로그·FAQ·이용자 후기·홈 히어로 슬라이드.
 *
 * 여러 번 실행해도 된다: 없는 행만 만든다(블로그·FAQ 카테고리는 slug, FAQ 항목·후기·히어로는 legacyKey 기준).
 * 이미 있는 행은 건드리지 않으므로 어드민에서 고친 내용이 덮이지 않는다.
 * (어드민에서 지운 기본 항목은 다시 실행하면 되살아난다 — 지우는 대신 숨김을 쓸 것)
 * 사이트 정보(SiteSetting web.site)는 행이 없으면 코드 기본값(=옛 하드코딩)이라 옮길 필요가 없다.
 *
 *   DATABASE_URL=postgresql://... pnpm --filter @bayada/db import:web
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { blogPosts } from "../../../apps/web/src/data/blog";
import { faqCategories } from "../../../apps/web/src/data/faq-data";
import { reviews } from "../../../apps/web/src/data/reviews";
import { heroSlides } from "../../../apps/web/src/data/hero";

const prisma = new PrismaClient();
const WEB_PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "../../../apps/web/public");

/** "2026-01-15" → KST 그날 0시 */
const kstDay = (d: string) => new Date(`${d}T00:00:00+09:00`);

/** 기본 데이터의 이미지 경로 중 실제 파일이 없는 자리표시(/images/blog/…)는 비운다 — 원래 화면도 표지 없음 */
const existingPublicPath = (p: string) => (p.startsWith("/") && existsSync(join(WEB_PUBLIC, p)) ? p : null);

async function main() {
  const counts = { blog: 0, faqCategories: 0, faqItems: 0, reviews: 0, hero: 0 };

  for (const p of blogPosts) {
    const found = await prisma.webBlogPost.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (found) continue;
    await prisma.webBlogPost.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        coverImage: existingPublicPath(p.image),
        author: p.author,
        body: p.content,
        tags: p.tags,
        readTime: p.readTime,
        isPublished: p.isPublished,
        publishedAt: kstDay(p.publishedAt),
      },
    });
    counts.blog++;
  }

  for (const [ci, c] of faqCategories.entries()) {
    let cat = await prisma.webFaqCategory.findUnique({ where: { slug: c.slug } });
    if (!cat) {
      cat = await prisma.webFaqCategory.create({ data: { slug: c.slug, name: c.name, order: ci } });
      counts.faqCategories++;
    }
    const res = await prisma.webFaqItem.createMany({
      data: c.items.map((it, i) => ({
        legacyKey: `${c.slug}-${i + 1}`,
        categoryId: cat.id,
        question: it.q,
        answer: it.a,
        order: i,
      })),
      skipDuplicates: true,
    });
    counts.faqItems += res.count;
  }

  const rv = await prisma.webReview.createMany({
    data: reviews.map((r, i) => ({
      legacyKey: r.id,
      rating: r.rating,
      content: r.content,
      author: r.author,
      serviceType: r.serviceType,
      reviewedAt: kstDay(r.createdAt),
      order: i,
    })),
    skipDuplicates: true,
  });
  counts.reviews = rv.count;

  const hero = await prisma.webHeroSlide.createMany({
    data: heroSlides.map((s, i) => ({
      legacyKey: s.id,
      imageUrl: s.src,
      alt: s.alt,
      title: s.title,
      subtitle: s.subtitle,
      ctaLabel: s.ctaLabel,
      ctaHref: s.ctaHref,
      order: i,
    })),
    skipDuplicates: true,
  });
  counts.hero = hero.count;

  console.log("[import:web] 새로 만든 행:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
