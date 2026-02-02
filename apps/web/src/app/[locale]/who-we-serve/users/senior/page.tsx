import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { userSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";

export const metadata = { title: "시니어 | BAYADA", description: "65세 이상 어르신을 위한 전문 홈헬스케어 서비스" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = userSegments.find((s) => s.slug === "senior")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
