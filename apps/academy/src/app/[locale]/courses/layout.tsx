import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 프로그램",
  description: "직군·주제·난이도별로 BAYADA Academy의 돌봄 교육 프로그램을 찾아보세요.",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
