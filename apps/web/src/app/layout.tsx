import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스. 방문간호, 방문요양, 교육 프로그램을 제공합니다.",
  keywords: [
    "홈헬스케어",
    "방문간호",
    "방문요양",
    "BAYADA",
    "바야다",
    "홈케어",
    "시니어 케어",
    "노인장기요양",
    "가정간호",
    "돌봄 서비스",
  ],
  authors: [{ name: "BAYADA 홈헬스케어" }],
  creator: "BAYADA 홈헬스케어",
  publisher: "BAYADA 홈헬스케어",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/brand/logo.png", sizes: "any" },
    ],
    apple: [
      { url: "/images/brand/logo.png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP", "zh_CN"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스. 방문간호, 방문요양, 교육 프로그램을 제공합니다.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "BAYADA 홈헬스케어",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스.",
    images: [DEFAULT_OG_IMAGE],
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
    // 구글/네이버/빙 사이트 인증 코드 추가 시 여기에
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
    <html lang="ko">
      <body className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
