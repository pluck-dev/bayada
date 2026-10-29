import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "BAYADA Academy에 무료로 가입하고 직군별 돌봄 교육을 시작하세요.",
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
