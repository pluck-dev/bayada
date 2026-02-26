import { createMetadata } from "@/lib/seo";
import { ChronicDiseaseClient } from "./ChronicDiseaseClient";

export const metadata = createMetadata({ title: "만성질환 케어", description: "만성질환 환자를 위한 가정 건강관리 서비스. 당뇨, 고혈압, 심장질환 등 전문 방문간호를 제공합니다.", path: "/ko/who-we-serve/users/chronic-disease" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ChronicDiseaseClient locale={locale} />;
}
