import type { MetadataRoute } from "next";
import { prisma } from "@bayada/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr";

const LOCALES = ["ko", "en", "ja", "zh"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages = LOCALES.flatMap((locale) => [
    {
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/${locale}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]);

  // 강의 상세 페이지 (동적)
  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    coursePages = courses.flatMap((course) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );
  } catch {
    // DB 연결 실패 시 정적 페이지만 반환
  }

  return [...staticPages, ...coursePages];
}
