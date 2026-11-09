import { kstDate } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { BlogForm } from "@/components/web/BlogForm";

export default async function NewWebBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  return (
    <>
      <PageHeader back={{ href: `/${locale}/web/blog`, label: "블로그" }} title="새 글" />
      <BlogForm
        locale={locale}
        id={null}
        initial={{
          slug: "",
          title: "",
          excerpt: "",
          category: "",
          coverImage: "",
          author: "BAYADA 편집팀",
          body: "",
          tags: "",
          readTime: 5,
          isPublished: false,
          publishedAt: kstDate(new Date()),
        }}
      />
    </>
  );
}
