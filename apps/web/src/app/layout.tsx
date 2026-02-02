import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAYADA 홈헬스케어",
  description:
    "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스. 방문간호, 방문요양, 교육 프로그램을 제공합니다.",
  keywords: ["홈헬스케어", "방문간호", "방문요양", "BAYADA", "바야다", "홈케어"],
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
