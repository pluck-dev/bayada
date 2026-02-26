import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getLatestPosts, blogCategories } from "@/data/blog";

interface LatestBlogProps {
  locale: string;
}

// 서버 컴포넌트
export function LatestBlog({ locale }: LatestBlogProps) {
  const posts = getLatestPosts(3);

  return (
    <section className="py-[var(--section-gap)] bg-white">
      <Container>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Blog
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--fg)] sm:text-4xl">
              최신 소식
            </h2>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="hidden text-sm font-medium uppercase tracking-wide text-[#ce0e2d] transition-colors hover:text-[#980019] sm:block"
          >
            전체보기 →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const category = blogCategories.find((c) => c.slug === post.category);
            return (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group rounded-lg border border-[color:var(--border)] bg-white p-5 transition-all hover:border-[#ce0e2d]/30 hover:shadow-sm"
              >
                {/* 카테고리 */}
                <span className="inline-block rounded bg-[#ce0e2d]/10 px-3 py-1 text-xs font-medium text-[#ce0e2d]">
                  {category?.name || post.category}
                </span>
                {/* 제목 */}
                <h3 className="mt-4 line-clamp-2 text-base font-semibold text-[color:var(--fg)] transition-colors group-hover:text-[#ce0e2d]">
                  {post.title}
                </h3>
                {/* 요약 */}
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[color:var(--muted)]">
                  {post.excerpt}
                </p>
                {/* 메타 */}
                <div className="mt-4 flex items-center gap-3 text-xs text-[color:var(--muted)]">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.readTime}분 읽기</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 모바일 전체보기 */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-medium uppercase tracking-wide text-[#ce0e2d] transition-colors hover:text-[#980019]"
          >
            전체보기 →
          </Link>
        </div>
      </Container>
    </section>
  );
}
