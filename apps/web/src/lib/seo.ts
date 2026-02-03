import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.bayada.co.kr";

export const SITE_NAME = "BAYADA 홈헬스케어";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/brand/og-image.png`;

/** 페이지별 메타데이터 생성 헬퍼 */
export function createMetadata({
  title,
  description,
  path = "",
  ogImage,
  type = "website",
  keywords,
  noIndex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
  /** true이면 title 템플릿 무시 (홈페이지 등) */
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords && { keywords }),
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "ko_KR",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

/** 블로그 포스트용 메타데이터 생성 */
export function createArticleMetadata({
  title,
  description,
  path,
  ogImage,
  publishedTime,
  author,
  tags,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  publishedTime?: string;
  author?: string;
  tags?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "ko_KR",
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
      ...(tags && { tags }),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
