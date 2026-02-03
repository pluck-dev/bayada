import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "기타 전문인", description: "BAYADA 네트워크에 참여할 수 있는 기타 전문인력. 함께 성장하는 파트너십을 제안합니다.", path: "/ko/who-we-serve/providers/other-professionals" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = providerSegments.find((s) => s.slug === "other-professionals")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
