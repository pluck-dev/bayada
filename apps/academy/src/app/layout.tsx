import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr";
const SITE_NAME = "BAYADA Academy";
const DEFAULT_DESCRIPTION =
  "BAYADA의 온라인 교육 플랫폼입니다. 전문 헬스케어 교육과 자격증 과정을 수강하고 역량을 키워보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 헬스케어 교육 플랫폼`,
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
    title: `${SITE_NAME} - 헬스케어 교육 플랫폼`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 헬스케어 교육 플랫폼`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
