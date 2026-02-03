import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { userSegments } from "@/data/audiences";
import { AudienceTemplate } from "@/components/templates/AudienceTemplate";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "장애인 케어", description: "장애인을 위한 맞춤 홈헬스케어 서비스. 일상생활 지원, 재활 운동, 전문 간호를 가정에서 제공합니다.", path: "/ko/who-we-serve/users/disability" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = userSegments.find((s) => s.slug === "disability")!;
  const dict = await getDictionary(locale as Locale);
  return <AudienceTemplate segment={segment} dict={dict} locale={locale} />;
}
