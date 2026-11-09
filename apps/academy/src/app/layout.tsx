import type { Metadata } from "next";
import localFont from "next/font/local";
import { ReviewGate } from "@bayada/review-ui/gate";
import "./globals.css";
import { getSiteSettings } from "@/lib/site-settings";

const latinFont = localFont({
  src: [
    { path: "../../public/fonts/FigtreeVariable.woff2", weight: "300 900", style: "normal" },
    { path: "../../public/fonts/FigtreeItalicVariable.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-academy-latin",
  display: "swap",
  preload: false,
});
const koreanFont = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  weight: "100 900",
  variable: "--font-academy-korean",
  display: "swap",
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr";

// 사이트 이름·기본 제목·설명·OG 이미지는 어드민 '사이트 설정 > SEO' 값 (없으면 기존 문구)
export async function generateMetadata(): Promise<Metadata> {
  const seo = (await getSiteSettings()).seo;
  const SITE_NAME = seo.siteName;
  const DEFAULT_DESCRIPTION = seo.description;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "BAYADA",
      "바야다",
      "교육 플랫폼",
      "헬스케어 교육",
      "온라인 강의",
      "방문간호 교육",
      "요양보호사 교육",
      "홈헬스케어",
      "간호 교육",
      "돌봄 교육",
    ],
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      alternateLocale: ["en_US", "ja_JP", "zh_CN"],
      siteName: SITE_NAME,
      title: seo.title,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: DEFAULT_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // 필요 시 Google Search Console, Naver Webmaster 인증 코드 추가
      // google: "인증코드",
      // other: { "naver-site-verification": "인증코드" },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${latinFont.variable} ${koreanFont.variable}`}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
        <ReviewGate site="academy" />
      </body>
    </html>
  );
}
