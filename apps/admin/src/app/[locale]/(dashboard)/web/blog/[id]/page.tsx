import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { kstDate } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { Badge, PageHeader } from "@/components/ui";
import { BlogForm } from "@/components/web/BlogForm";

export default async function EditWebBlogPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("web.content", locale);
  const p = await prisma.webBlogPost.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/web/blog`, label: "블로그" }}
        title={
          <span className="flex items-center gap-2">
            {p.title}
            {p.isPublished ? <Badge tone="green" dot>게시</Badge> : <Badge tone="zinc">초안</Badge>}
          </span>
        }
      />
      <BlogForm
        key={p.updatedAt.toISOString()}
        locale={locale}
        id={p.id}
        initial={{
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          coverImage: p.coverImage ?? "",
          author: p.author,
          body: p.body,
          tags: p.tags.join(", "),
          readTime: p.readTime,
          isPublished: p.isPublished,
          publishedAt: kstDate(p.publishedAt),
        }}
      />
    </>
  );
}
