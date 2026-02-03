import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 강의",
  description:
    "BAYADA Academy의 모든 강의를 둘러보세요. 헬스케어 전문 교육, 자격증 과정, 실무 역량 강화 프로그램을 제공합니다.",
  openGraph: {
    title: "전체 강의 | BAYADA Academy",
    description:
      "BAYADA Academy의 모든 강의를 둘러보세요. 헬스케어 전문 교육, 자격증 과정, 실무 역량 강화 프로그램을 제공합니다.",
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
