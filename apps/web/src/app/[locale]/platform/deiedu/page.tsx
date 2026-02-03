import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPlatformBySlug } from "@/data/platforms";
import { PlatformDetailTemplate } from "@/components/templates/PlatformDetailTemplate";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "DeiEdu - 교육 플랫폼", description: "BAYADA 50년 노하우 기반 헬스케어 교육 플랫폼 DeiEdu. 제공자 전문 교육, 이용자 보호자 교육 과정을 제공합니다.", path: "/ko/platform/deiedu" });

export default async function DeiEduPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const platform = getPlatformBySlug("deiedu");
  if (!platform) notFound();
  const dict = await getDictionary(locale as Locale);
  return <PlatformDetailTemplate platform={platform} dict={dict} locale={locale} />;
}
