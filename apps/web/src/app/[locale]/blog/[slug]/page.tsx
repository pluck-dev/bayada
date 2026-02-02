import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { blogPosts, getPostBySlug, blogCategories, getLatestPosts } from "@/data/blog";
import { Container } from "@/components/layout/Container";

export function generateStaticParams() {
  return blogPosts.filter((p) => p.isPublished).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | BAYADA Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();
  const dict = await getDictionary(locale as Locale);
  const related = getLatestPosts(3).filter((p) => p.slug !== slug);

  return (
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
        <div className="mt-8 h-64 rounded-2xl bg-[color:var(--surface)]" />
        <div className="mt-8 text-base leading-relaxed text-[color:var(--muted)]">
          <p>{post.content}</p>
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
  );
}
