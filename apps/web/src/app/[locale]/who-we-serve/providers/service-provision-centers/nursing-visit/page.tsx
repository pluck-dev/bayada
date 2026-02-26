import { createMetadata } from "@/lib/seo";
import { NursingVisitClient } from "./NursingVisitClient";

export const metadata = createMetadata({ title: "방문간호 제공기관", description: "방문간호 서비스 제공기관을 위한 BAYADA 솔루션. DeiCloud 운영 시스템과 전문 교육을 제공합니다.", path: "/ko/who-we-serve/providers/service-provision-centers/nursing-visit" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <NursingVisitClient locale={locale} />;
}
