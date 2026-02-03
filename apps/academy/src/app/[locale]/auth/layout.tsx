import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "BAYADA Academy에 로그인하여 다양한 헬스케어 교육을 수강하세요.",
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
