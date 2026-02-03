import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "병원 파트너십", description: "병원을 위한 BAYADA 전환의료 파트너십. 퇴원 환자 가정 복귀 지원으로 재입원율을 줄입니다.", path: "/ko/who-we-serve/providers/medical-institutes/hospitals" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = providerSegments.find((s) => s.slug === "hospitals")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
