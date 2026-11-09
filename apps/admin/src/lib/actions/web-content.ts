"use server";

// 홈페이지 콘텐츠 관리 — 블로그·FAQ·이용자 후기·메인 히어로. 저장 후 홈페이지 재생성(revalidateWeb)을 부른다.
import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { safeHref } from "@bayada/shared/site-settings";
import { WEB_BLOG_CATEGORIES, WEB_SERVICE_OPTIONS } from "@bayada/shared/web-content";
import { ActionError, audit, runAction } from "../session";
import { revalidateWeb } from "../web-revalidate";

async function done(section: "blog" | "faq" | "reviews" | "hero", what: string) {
  revalidatePath(`/[locale]/(dashboard)/web/${section}`, "layout");
  return { message: `${what} ${await revalidateWeb()}` };
}

const req = (v: unknown, label: string, max: number): string => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new ActionError(`${label}을(를) 입력하세요.`);
  if (s.length > max) throw new ActionError(`${label}은(는) ${max.toLocaleString()}자 이내로 입력하세요.`);
  return s;
};
const opt = (v: unknown, label: string, max: number): string => {
  const s = typeof v === "string" ? v.trim() : "";
  if (s.length > max) throw new ActionError(`${label}은(는) ${max.toLocaleString()}자 이내로 입력하세요.`);
  return s;
};
/** 이미지 주소: 사이트 안 경로(/images/…) 또는 http(s) */
const imageUrl = (v: unknown, label: string, required: boolean): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) {
    if (required) throw new ActionError(`${label}을(를) 입력하세요.`);
    return null;
  }
  if (!/^(https?:\/\/|\/(?!\/))/i.test(s) || s.length > 500) throw new ActionError(`${label}은(는) /images/… 경로 또는 https:// 주소여야 합니다.`);
  return s;
};
const kstDay = (v: unknown, label: string): Date => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new ActionError(`${label}을(를) 입력하세요.`);
  const d = new Date(`${v}T00:00:00+09:00`);
  if (Number.isNaN(d.getTime())) throw new ActionError(`${label}이(가) 올바르지 않습니다.`);
  return d;
};
const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

// ─── 블로그 ───

export interface BlogInput {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  author: string;
  body: string;
  tags: string;
  readTime: number;
  isPublished: boolean;
  publishedAt: string; // YYYY-MM-DD (KST)
}

function cleanBlog(input: BlogInput) {
  const slug = req(input.slug, "주소(slug)", 120).toLowerCase();
  if (!/^[\p{Ll}\p{Lo}\p{N}]+(?:-[\p{Ll}\p{Lo}\p{N}]+)*$/u.test(slug)) {
    throw new ActionError("주소(slug)는 소문자·한글·숫자와 하이픈(-)만 쓸 수 있습니다. 예) fall-prevention-seniors");
  }
  if (!WEB_BLOG_CATEGORIES.some((c) => c.slug === input.category)) throw new ActionError("카테고리를 선택하세요.");
  const tags = [...new Set(String(input.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 20);
  return {
    slug,
    title: req(input.title, "제목", 200),
    excerpt: opt(input.excerpt, "요약", 500),
    category: input.category,
    coverImage: imageUrl(input.coverImage, "표지 이미지", false),
    author: opt(input.author, "작성자", 60),
    body: req(input.body, "본문", 50_000),
    tags,
    readTime: int(input.readTime, 1, 120, 5),
    isPublished: input.isPublished === true,
    publishedAt: kstDay(input.publishedAt, "게시일"),
  };
}

export async function createBlogPost(input: BlogInput) {
  return runAction("web.content", async (user) => {
    const p = await prisma.webBlogPost.create({ data: cleanBlog(input) });
    await audit(user.id, "web.blog.create", `WebBlogPost:${p.id}`, { title: p.title, isPublished: p.isPublished });
    return { ...(await done("blog", "글을 만들었습니다.")), data: { id: p.id } };
  });
}

export async function updateBlogPost(id: string, input: BlogInput) {
  return runAction("web.content", async (user) => {
    const before = await prisma.webBlogPost.findUnique({ where: { id }, select: { title: true, slug: true, isPublished: true } });
    if (!before) throw new ActionError("글을 찾을 수 없습니다.");
    const p = await prisma.webBlogPost.update({ where: { id }, data: cleanBlog(input) });
    await audit(user.id, "web.blog.update", `WebBlogPost:${id}`, {
      title: p.title,
      ...(before.slug !== p.slug ? { slug: { from: before.slug, to: p.slug } } : {}),
      ...(before.isPublished !== p.isPublished ? { isPublished: p.isPublished } : {}),
    });
    return done("blog", "저장했습니다.");
  });
}

export async function deleteBlogPost(id: string) {
  return runAction("web.content", async (user) => {
    const p = await prisma.webBlogPost.delete({ where: { id } });
    await audit(user.id, "web.blog.delete", `WebBlogPost:${id}`, { title: p.title, slug: p.slug });
    return done("blog", "글을 삭제했습니다.");
  });
}

// ─── FAQ ───

export async function saveFaqCategory(id: string | null, input: { slug: string; name: string }) {
  return runAction("web.content", async (user) => {
    const slug = req(input.slug, "카테고리 주소(slug)", 40).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ActionError("카테고리 주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다.");
    const name = req(input.name, "카테고리 이름", 30);
    if (id) {
      await prisma.webFaqCategory.update({ where: { id }, data: { slug, name } });
      await audit(user.id, "web.faq.category", `WebFaqCategory:${id}`, { name, slug });
      return done("faq", "카테고리를 저장했습니다.");
    }
    const last = await prisma.webFaqCategory.aggregate({ _max: { order: true } });
    const c = await prisma.webFaqCategory.create({ data: { slug, name, order: (last._max.order ?? -1) + 1 } });
    await audit(user.id, "web.faq.category", `WebFaqCategory:${c.id}`, { name, slug, created: true });
    return done("faq", "카테고리를 만들었습니다.");
  });
}

export async function deleteFaqCategory(id: string) {
  return runAction("web.content", async (user) => {
    const n = await prisma.webFaqItem.count({ where: { categoryId: id } });
    if (n > 0) throw new ActionError(`질문이 ${n}개 있는 카테고리는 지울 수 없습니다. 질문을 먼저 옮기거나 지우세요.`);
    const c = await prisma.webFaqCategory.delete({ where: { id } });
    await audit(user.id, "web.faq.category", `WebFaqCategory:${id}`, { name: c.name, deleted: true });
    return done("faq", "카테고리를 삭제했습니다.");
  });
}

/** 같은 목록 안에서 위/아래 한 칸 — 순서 값을 0..n 으로 다시 매긴다 */
async function reorder<T extends { id: string }>(list: T[], id: string, dir: -1 | 1, write: (id: string, order: number) => Promise<unknown>) {
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return false;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  await Promise.all(next.map((x, k) => write(x.id, k)));
  return true;
}

export async function moveFaqCategory(id: string, dir: -1 | 1) {
  return runAction("web.content", async (user) => {
    const list = await prisma.webFaqCategory.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } });
    if (!(await reorder(list, id, dir, (cid, order) => prisma.webFaqCategory.update({ where: { id: cid }, data: { order } })))) return {};
    await audit(user.id, "web.faq.reorder", `WebFaqCategory:${id}`, { dir });
    return done("faq", "순서를 바꿨습니다.");
  });
}

export interface FaqItemInput {
  categoryId: string;
  question: string;
  answer: string;
  visible: boolean;
}

export async function saveFaqItem(id: string | null, input: FaqItemInput) {
  return runAction("web.content", async (user) => {
    const cat = await prisma.webFaqCategory.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!cat) throw new ActionError("카테고리를 선택하세요.");
    const data = {
      categoryId: cat.id,
      question: req(input.question, "질문", 300),
      answer: req(input.answer, "답변", 5000),
      visible: input.visible !== false,
    };
    if (id) {
      const before = await prisma.webFaqItem.findUnique({ where: { id }, select: { categoryId: true } });
      if (!before) throw new ActionError("질문을 찾을 수 없습니다.");
      // 카테고리를 옮기면 새 카테고리 맨 뒤로
      const order =
        before.categoryId === cat.id
          ? undefined
          : ((await prisma.webFaqItem.aggregate({ where: { categoryId: cat.id }, _max: { order: true } }))._max.order ?? -1) + 1;
      await prisma.webFaqItem.update({ where: { id }, data: { ...data, ...(order === undefined ? {} : { order }) } });
      await audit(user.id, "web.faq.update", `WebFaqItem:${id}`, { question: data.question, visible: data.visible });
      return done("faq", "질문을 저장했습니다.");
    }
    const last = await prisma.webFaqItem.aggregate({ where: { categoryId: cat.id }, _max: { order: true } });
    const it = await prisma.webFaqItem.create({ data: { ...data, order: (last._max.order ?? -1) + 1 } });
    await audit(user.id, "web.faq.create", `WebFaqItem:${it.id}`, { question: it.question });
    return done("faq", "질문을 추가했습니다.");
  });
}

export async function moveFaqItem(id: string, dir: -1 | 1) {
  return runAction("web.content", async (user) => {
    const it = await prisma.webFaqItem.findUnique({ where: { id }, select: { categoryId: true } });
    if (!it) throw new ActionError("질문을 찾을 수 없습니다.");
    const list = await prisma.webFaqItem.findMany({
      where: { categoryId: it.categoryId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    });
    if (!(await reorder(list, id, dir, (iid, order) => prisma.webFaqItem.update({ where: { id: iid }, data: { order } })))) return {};
    await audit(user.id, "web.faq.reorder", `WebFaqItem:${id}`, { dir });
    return done("faq", "순서를 바꿨습니다.");
  });
}

export async function deleteFaqItem(id: string) {
  return runAction("web.content", async (user) => {
    const it = await prisma.webFaqItem.delete({ where: { id } });
    await audit(user.id, "web.faq.delete", `WebFaqItem:${id}`, { question: it.question });
    return done("faq", "질문을 삭제했습니다.");
  });
}

// ─── 이용자 후기 ───

export interface WebReviewInput {
  rating: number;
  content: string;
  author: string;
  serviceType: string;
  reviewedAt: string;
  visible: boolean;
  order: number;
}

function cleanReview(input: WebReviewInput) {
  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) throw new ActionError("별점은 1~5 사이로 고르세요.");
  if (!WEB_SERVICE_OPTIONS.some((s) => s.slug === input.serviceType)) throw new ActionError("서비스 유형을 선택하세요.");
  return {
    rating,
    content: req(input.content, "후기 내용", 2000),
    author: req(input.author, "작성자 표기", 40),
    serviceType: input.serviceType,
    reviewedAt: kstDay(input.reviewedAt, "작성일"),
    visible: input.visible !== false,
    order: int(input.order, 0, 9999, 0),
  };
}

export async function saveWebReview(id: string | null, input: WebReviewInput) {
  return runAction("web.content", async (user) => {
    const data = cleanReview(input);
    if (id) {
      await prisma.webReview.update({ where: { id }, data });
      await audit(user.id, "web.review.update", `WebReview:${id}`, { author: data.author, visible: data.visible });
      return done("reviews", "후기를 저장했습니다.");
    }
    const r = await prisma.webReview.create({ data });
    await audit(user.id, "web.review.create", `WebReview:${r.id}`, { author: r.author });
    return done("reviews", "후기를 추가했습니다.");
  });
}

export async function setWebReviewVisible(id: string, visible: boolean) {
  return runAction("web.content", async (user) => {
    const r = await prisma.webReview.update({ where: { id }, data: { visible } });
    await audit(user.id, "web.review.update", `WebReview:${id}`, { author: r.author, visible });
    return done("reviews", visible ? "후기를 다시 보이게 했습니다." : "후기를 숨겼습니다.");
  });
}

export async function deleteWebReview(id: string) {
  return runAction("web.content", async (user) => {
    const r = await prisma.webReview.delete({ where: { id } });
    await audit(user.id, "web.review.delete", `WebReview:${id}`, { author: r.author });
    return done("reviews", "후기를 삭제했습니다.");
  });
}

// ─── 메인 히어로 슬라이드 ───

export interface HeroSlideInput {
  imageUrl: string;
  alt: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  visible: boolean;
}

function cleanSlide(input: HeroSlideInput) {
  const ctaLabel = opt(input.ctaLabel, "버튼 문구", 30);
  const rawHref = opt(input.ctaHref, "버튼 링크", 300);
  const ctaHref = rawHref ? safeHref(rawHref) : "";
  if (rawHref && !ctaHref) throw new ActionError("버튼 링크는 #위치, /경로, https://, mailto:, tel: 만 쓸 수 있습니다.");
  if (ctaLabel && !ctaHref) throw new ActionError("버튼 문구가 있으면 버튼 링크도 입력하세요.");
  return {
    imageUrl: imageUrl(input.imageUrl, "이미지", true) as string,
    alt: opt(input.alt, "대체 텍스트", 120),
    title: req(input.title, "제목", 120),
    subtitle: opt(input.subtitle, "부제", 400),
    ctaLabel,
    ctaHref,
    order: int(input.order, 0, 999, 0),
    visible: input.visible !== false,
  };
}

export async function saveHeroSlide(id: string | null, input: HeroSlideInput) {
  return runAction("web.content", async (user) => {
    const data = cleanSlide(input);
    if (id) {
      await prisma.webHeroSlide.update({ where: { id }, data });
      await audit(user.id, "web.hero.update", `WebHeroSlide:${id}`, { title: data.title, visible: data.visible });
      return done("hero", "슬라이드를 저장했습니다.");
    }
    const s = await prisma.webHeroSlide.create({ data });
    await audit(user.id, "web.hero.create", `WebHeroSlide:${s.id}`, { title: s.title });
    return done("hero", "슬라이드를 추가했습니다.");
  });
}

export async function deleteHeroSlide(id: string) {
  return runAction("web.content", async (user) => {
    const s = await prisma.webHeroSlide.delete({ where: { id } });
    await audit(user.id, "web.hero.delete", `WebHeroSlide:${id}`, { title: s.title });
    return done("hero", "슬라이드를 삭제했습니다.");
  });
}
