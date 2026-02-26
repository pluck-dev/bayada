"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Tag,
  BookOpen,
  ArrowRight,
  User,
} from "lucide-react";
import type { BlogPost } from "@/types";
import { Container } from "@/components/layout/Container";

// ─────────────────────────────────────────────
// 타입 / 상수
// ─────────────────────────────────────────────
interface Category {
  slug: string;
  name: string;
}

interface BlogClientProps {
  posts: BlogPost[];
  categories: Category[];
  locale: string;
}

const BAYADA_RED = "#ce0e2d";
const LIGHT_BG = "#f5f7f9";

// 카테고리별 그라디언트 팔레트 (이미지 플레이스홀더)
const CATEGORY_GRADIENTS: Record<string, string> = {
  "bayada-story": "from-rose-700 to-red-500",
  policy: "from-blue-700 to-blue-400",
  "disease-info": "from-teal-600 to-emerald-400",
  "care-guide": "from-violet-600 to-purple-400",
  news: "from-orange-600 to-amber-400",
};

function getCategoryGradient(slug: string) {
  return CATEGORY_GRADIENTS[slug] ?? "from-slate-600 to-slate-400";
}

// 날짜 포맷 헬퍼
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─────────────────────────────────────────────
// 서브 컴포넌트
// ─────────────────────────────────────────────

/** 피처드 포스트 (첫 번째 글 - 와이드 카드) */
function FeaturedPost({
  post,
  locale,
  categories,
}: {
  post: BlogPost;
  locale: string;
  categories: Category[];
}) {
  const catName =
    categories.find((c) => c.slug === post.category)?.name ?? post.category;
  const gradient = getCategoryGradient(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <Link href={`/${locale}/blog/${post.slug}`} className="grid lg:grid-cols-2">
        {/* 이미지 영역 */}
        <div
          className={`relative min-h-[280px] lg:min-h-[420px] bg-gradient-to-br ${gradient} overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20" />
          {/* 카테고리 뱃지 (이미지 위) */}
          <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-semibold text-white">
            <BookOpen size={12} />
            {catName}
          </span>
          {/* 읽기 시간 */}
          <span className="absolute bottom-6 left-6 inline-flex items-center gap-1.5 text-white/80 text-xs">
            <Clock size={12} />
            {post.readTime}분 읽기
          </span>
          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: BAYADA_RED }}
            >
              Featured
            </span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold leading-snug text-black/[0.87] group-hover:text-[#ce0e2d] transition-colors duration-300 line-clamp-3">
            {post.title}
          </h2>

          <p className="mt-4 text-black/60 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-black/50">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.publishedAt)}
            </span>
          </div>

          <div className="mt-8">
            <span
              className="inline-flex items-center gap-2 rounded-lg px-6 py-[13px] text-base font-medium text-white transition-colors group-hover:translate-x-1 duration-300"
              style={{ background: BAYADA_RED }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.background = "#980019";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.background = BAYADA_RED;
              }}
            >
              자세히 읽기 <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/** 일반 포스트 카드 */
function PostCard({
  post,
  locale,
  categories,
  index,
  large = false,
}: {
  post: BlogPost;
  locale: string;
  categories: Category[];
  index: number;
  large?: boolean;
}) {
  const catName =
    categories.find((c) => c.slug === post.category)?.name ?? post.category;
  const gradient = getCategoryGradient(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <Link href={`/${locale}/blog/${post.slug}`} className="block h-full">
        {/* 이미지 플레이스홀더 */}
        <div
          className={`relative w-full bg-gradient-to-br ${gradient} overflow-hidden ${large ? "h-52" : "h-40"}`}
        >
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {catName}
          </span>
          <span className="absolute bottom-3 right-4 flex items-center gap-1 text-white/75 text-xs">
            <Clock size={11} />
            {post.readTime}분
          </span>
        </div>

        {/* 카드 본문 */}
        <div className="p-5">
          <h3
            className={`font-bold leading-snug text-black/[0.87] group-hover:text-[#ce0e2d] transition-colors duration-200 line-clamp-2 ${large ? "text-lg" : "text-base"}`}
          >
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-black/60 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-black/50">
            <span className="flex items-center gap-1">
              <User size={12} />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </div>

        {/* 하단 읽기 링크 */}
        <div className="px-5 pb-4">
          <span
            className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: BAYADA_RED }}
          >
            읽기 <ChevronRight size={13} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

// ─────────────────────────────────────────────
// 메인 클라이언트 컴포넌트
// ─────────────────────────────────────────────
export default function BlogClient({ posts, categories, locale }: BlogClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // 카테고리별 포스트 수
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = { all: posts.length };
    for (const cat of categories) {
      map[cat.slug] = posts.filter((p) => p.category === cat.slug).length;
    }
    return map;
  }, [posts, categories]);

  // 필터링된 포스트
  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  // 피처드: 첫 번째 포스트 (카테고리 필터와 무관하게 원본 첫 번째)
  const featuredPost = posts[0];
  // 나머지 포스트 (피처드 제외, 필터 적용)
  const remainingPosts = useMemo(() => {
    const list =
      activeCategory === "all"
        ? posts.slice(1)
        : posts.filter((p) => p.category === activeCategory);
    return list;
  }, [posts, activeCategory]);

  // 모든 태그 (중복 제거)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [posts]);

  return (
    <div className="min-h-screen bg-white">
      {/* ────────── 1. 히어로 ────────── */}
      <section className="relative overflow-hidden bg-[#f5f7f9] py-16 lg:py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <span
              className="mb-4 text-sm font-semibold uppercase tracking-wide"
              style={{ color: BAYADA_RED }}
            >
              BAYADA 건강 블로그
            </span>
            <h1
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              Blog
            </h1>
            <p className="mt-5 max-w-xl text-lg text-black/60 leading-relaxed">
              홈헬스케어 소식, 건강 정보, 케어 가이드, 제도·정책 업데이트를
              만나보세요.
            </p>

            {/* 검색 인풋 */}
            <div className="mt-10 w-full max-w-xl">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-black/50"
                />
                <input
                  type="text"
                  placeholder="건강 정보, 케어 가이드 검색..."
                  readOnly
                  className="w-full rounded-lg border border-black/10 bg-white py-4 pl-14 pr-36 text-sm text-black/[0.87] shadow-sm placeholder:text-black/40 focus:outline-none focus:ring-2 cursor-text"
                  style={{ "--tw-ring-color": `${BAYADA_RED}40` } as React.CSSProperties}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors"
                  style={{ background: BAYADA_RED }}
                >
                  검색
                </span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ────────── 2. 피처드 포스트 ────────── */}
      {featuredPost && activeCategory === "all" && (
        <section className="bg-white py-10">
          <Container>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-lg font-bold text-black/[0.87]">주요 글</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>
            <FeaturedPost
              post={featuredPost}
              locale={locale}
              categories={categories}
            />
          </Container>
        </section>
      )}

      {/* ────────── 3. 카테고리 필터 바 ────────── */}
      <section className="sticky top-16 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-md py-4 shadow-sm">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* 전체 버튼 */}
            <CategoryPill
              label="전체"
              count={countByCategory["all"]}
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.slug}
                label={cat.name}
                count={countByCategory[cat.slug] ?? 0}
                active={activeCategory === cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ────────── 4. 포스트 그리드 ────────── */}
      <section className="bg-white py-14">
        <Container>
          <AnimatePresence mode="popLayout">
            {remainingPosts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center text-black/50"
              >
                <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">해당 카테고리의 글이 없습니다.</p>
              </motion.div>
            ) : (
              <motion.div key={activeCategory} className="space-y-6">
                {/* 상단 2열 대형 카드 */}
                {remainingPosts.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {remainingPosts.slice(0, 2).map((post, i) => (
                      <PostCard
                        key={post.slug}
                        post={post}
                        locale={locale}
                        categories={categories}
                        index={i}
                        large
                      />
                    ))}
                  </div>
                )}

                {/* 뉴스레터 CTA (그리드 중간 삽입) */}
                {remainingPosts.length >= 3 && (
                  <NewsletterBanner />
                )}

                {/* 하단 3열 소형 카드 */}
                {remainingPosts.length > 2 && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {remainingPosts.slice(2).map((post, i) => (
                      <PostCard
                        key={post.slug}
                        post={post}
                        locale={locale}
                        categories={categories}
                        index={i + 2}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* ────────── 5. 태그 클라우드 ────────── */}
      <section style={{ background: LIGHT_BG }} className="py-14">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-3">
              <Tag size={18} style={{ color: BAYADA_RED }} />
              <h2 className="text-lg font-bold text-black/[0.87]">태그</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {allTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.06 }}
                  className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm text-black/60 shadow-sm hover:border-[#ce0e2d] hover:text-[#ce0e2d] transition-colors duration-200"
                >
                  # {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ────────── 6. 하단 CTA ────────── */}
      <BottomCTA locale={locale} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 카테고리 필 컴포넌트
// ─────────────────────────────────────────────
function CategoryPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "text-white shadow-md"
          : "border border-black/10 bg-white text-black/60 hover:border-black/20 hover:text-black/[0.87]"
      }`}
      style={active ? { background: BAYADA_RED } : {}}
    >
      {active && (
        <motion.span
          layoutId="active-cat-bg"
          className="absolute inset-0 rounded-full"
          style={{ background: BAYADA_RED }}
        />
      )}
      <span className="relative z-10">{label}</span>
      <span
        className={`relative z-10 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
          active ? "bg-white/25 text-white" : "bg-black/[0.06] text-black/50"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// 뉴스레터 배너
// ─────────────────────────────────────────────
function NewsletterBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl ring-1 ring-black/5 bg-[#f5f7f9]"
    >
      <div className="relative px-8 py-10 lg:py-12">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-black/[0.87]">
              건강 뉴스레터 구독
            </h3>
            <p className="mt-2 text-black/60">
              매월 최신 홈헬스케어 소식과 건강 정보를 이메일로 받아보세요.
            </p>
          </div>
          <div className="flex w-full max-w-sm shrink-0 gap-2">
            <input
              type="email"
              placeholder="이메일 주소 입력"
              className="flex-1 rounded-lg border border-black/10 bg-white px-5 py-3 text-sm text-black/[0.87] placeholder:text-black/40 focus:outline-none focus:ring-2 shadow-sm"
              style={{ "--tw-ring-color": `${BAYADA_RED}40` } as React.CSSProperties}
            />
            <button
              className="shrink-0 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              구독하기
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// 하단 CTA
// ─────────────────────────────────────────────
function BottomCTA({ locale }: { locale: string }) {
  return (
    <section className="py-16 lg:py-24 bg-[#f5f7f9]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: BAYADA_RED }}>
            더 알아보기
          </span>
          <h2
            className="mt-3 font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            더 많은 건강 정보가 필요하신가요?
          </h2>
          <p className="mt-4 text-black/60 leading-relaxed">
            자주 묻는 질문을 확인하거나 전문 상담팀에 직접 문의해 보세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/faq`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc]"
            >
              <BookOpen size={16} />
              자주 묻는 질문
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
            >
              <ArrowRight size={16} />
              상담 문의하기
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
