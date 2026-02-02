import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPublishedPosts, blogCategories } from "@/data/blog";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Blog | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 블로그 - 홈헬스케어 소식과 건강 정보",
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const posts = getPublishedPosts();

  return (
    <>
      <PageHero title="Blog" subtitle="홈헬스케어 소식과 건강 정보" />
      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 카테고리 필터 */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ce0e2d] px-4 py-2 text-sm font-medium text-white">전체</span>
            {blogCategories.map((cat) => (
              <span key={cat.slug} className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--muted)] cursor-pointer hover:border-[#ce0e2d]/30">{cat.name}</span>
            ))}
          </div>

          {/* 포스트 그리드 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group rounded-2xl border border-[color:var(--border)] overflow-hidden transition-all hover:shadow-[var(--shadow-medium)]">
                <div className="h-48 bg-[color:var(--surface)]" />
                <div className="p-5">
                  <span className="text-xs font-medium text-[#ce0e2d]">{blogCategories.find((c) => c.slug === post.category)?.name}</span>
                  <h3 className="mt-2 font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d] line-clamp-2">{post.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)] line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[color:var(--muted)]">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.publishedAt}</span>
                    <span>·</span>
                    <span>{post.readTime}분</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
