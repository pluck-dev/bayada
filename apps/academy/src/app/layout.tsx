import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAYADA Academy - 교육 플랫폼",
  description:
    "BAYADA의 온라인 교육 플랫폼입니다. 다양한 강의를 수강하고 역량을 키워보세요.",
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
