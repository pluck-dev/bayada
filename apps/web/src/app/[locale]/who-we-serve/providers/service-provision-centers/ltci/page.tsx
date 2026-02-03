import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "장기요양 제공기관", description: "장기요양 서비스 제공기관을 위한 BAYADA 파트너십. 품질 관리, 인력 교육, 운영 효율화를 지원합니다.", path: "/ko/who-we-serve/providers/service-provision-centers/ltci" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = providerSegments.find((s) => s.slug === "ltci-center")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
