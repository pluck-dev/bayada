import { createMetadata } from "@/lib/seo";
import { CareersClient } from "./CareersClient";

export const metadata = createMetadata({
  title: "채용 정보",
  description:
    "바야다홈헬스케어 채용 정보 - 간호사, 요양보호사, 물리치료사 등 홈헬스케어 전문가를 모집합니다.",
  path: "/ko/careers",
});

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <CareersClient locale={locale} />;
}
