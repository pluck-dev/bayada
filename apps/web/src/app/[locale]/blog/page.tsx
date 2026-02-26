import { createMetadata } from "@/lib/seo";
import { getPublishedPosts, blogCategories } from "@/data/blog";
import BlogClient from "./BlogClient";
import type { Locale } from "@bayada/shared/i18n";

export const metadata = createMetadata({
  title: "블로그",
  description:
    "바야다홈헬스케어 블로그 - 홈헬스케어 소식, 건강 정보, 케어 가이드, 제도·정책 업데이트를 만나보세요.",
  path: "/ko/blog",
});

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = getPublishedPosts();

  return (
    <BlogClient
      posts={posts}
      categories={blogCategories}
      locale={locale}
    />
  );
}
