import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createArticleMetadata, SITE_URL } from "@/lib/seo";
import { getPublishedPosts, getPostBySlug, blogCategories, getLatestPosts } from "@/lib/web-content";
import { Container } from "@/components/layout/Container";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

// 빌드 때 있는 글만 미리 만들고, 어드민에서 새로 게시한 글은 첫 요청 때 만든다(dynamicParams 기본값 true)
export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) return {};
  return createArticleMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/${locale}/blog/${slug}`,
    publishedTime: post.publishedAt,
    author: post.author,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();
  const dict = await getDictionary(locale as Locale);
  const related = (await getLatestPosts(3)).filter((p) => p.slug !== slug);

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        url={`${SITE_URL}/${locale}/blog/${slug}`}
        publishedTime={post.publishedAt}
        author={post.author}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", url: `${SITE_URL}/${locale}` },
          { name: "블로그", url: `${SITE_URL}/${locale}/blog` },
          { name: post.title, url: `${SITE_URL}/${locale}/blog/${slug}` },
        ]}
      />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <Link href={`/${locale}/blog`} className="text-sm text-[color:var(--muted)] hover:text-[#ce0e2d]">← Blog</Link>
          <div className="mt-6">
            <span className="text-xs font-medium text-[#ce0e2d]">{blogCategories.find((c) => c.slug === post.category)?.name}</span>
            <h1 className="mt-2 text-3xl font-bold text-[color:var(--fg)]">{post.title}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-[color:var(--muted)]">
              <span>{post.author}</span><span>·</span><span>{post.publishedAt}</span><span>·</span><span>{post.readTime}분 읽기</span>
            </div>
          </div>
          {post.image ? (
            // 어드민에서 넣은 표지 URL (외부 주소일 수 있어 next/image 대신 img)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image} alt="" className="mt-8 h-64 w-full rounded-2xl bg-[color:var(--surface)] object-cover" />
          ) : (
            <div className="mt-8 h-64 rounded-2xl bg-[color:var(--surface)]" />
          )}
          <div className="mt-8 space-y-4 text-base leading-relaxed text-[color:var(--muted)]">
            {/* 빈 줄로 문단을 나눈다. 문단 안 줄바꿈은 그대로 */}
            {post.content.split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
          {related.length > 0 && (
            <div className="mt-12 border-t border-[color:var(--border)] pt-8">
              <h2 className="text-lg font-bold text-[color:var(--fg)]">관련 글</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={`/${locale}/blog/${r.slug}`} className="rounded-xl border border-[color:var(--border)] p-4 hover:border-[#ce0e2d]/30">
                    <h3 className="text-sm font-medium text-[color:var(--fg)] line-clamp-2">{r.title}</h3>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{r.publishedAt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
