import type { MetadataRoute } from "next";
import { i18nConfig } from "@bayada/shared/i18n";
import { getPublishedPosts } from "@/lib/web-content";
import { getServices } from "@/lib/web-services";

// 블로그 글이 DB 에서 오므로 주기적으로 다시 만든다
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bayada.co.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const services = await getServices();
  const locales = i18nConfig.locales;

  // 정적 페이지 목록
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/what-we-do", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/users", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/users/senior", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/healthcare-professionals", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/other-professionals", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/medical-institutes/hospitals", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/medical-institutes/clinics", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/service-provision-centers/ltci", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/service-provision-centers/nursing-visit", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-serve/providers/local-government", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/partnership", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/reviews", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/careers", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/guide", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  // 로케일별 정적 페이지
  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${SITE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // 블로그 포스트 (동적)
  const blogEntries = locales.flatMap((locale) =>
    posts.map((post) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  // 서비스 상세 (동적)
  const serviceEntries = locales.flatMap((locale) =>
    services.map((service) => ({
      url: `${SITE_URL}/${locale}/what-we-do/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...blogEntries, ...serviceEntries];
}
