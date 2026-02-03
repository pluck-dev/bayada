import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "방문간호 제공기관", description: "방문간호 서비스 제공기관을 위한 BAYADA 솔루션. DeiCloud 운영 시스템과 전문 교육을 제공합니다.", path: "/ko/who-we-serve/providers/service-provision-centers/nursing-visit" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = providerSegments.find((s) => s.slug === "nursing-visit-center")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
