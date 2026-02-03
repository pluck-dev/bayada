import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "의료 전문인", description: "의료 전문인을 위한 BAYADA 파트너 프로그램. 전문성 개발, 교육, 네트워크 기회를 제공합니다.", path: "/ko/who-we-serve/providers/healthcare-professionals" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = providerSegments.find((s) => s.slug === "healthcare-professionals")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
