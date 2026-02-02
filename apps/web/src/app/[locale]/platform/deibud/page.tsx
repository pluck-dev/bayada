import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPlatformBySlug } from "@/data/platforms";
import { PlatformDetailTemplate } from "@/components/templates/PlatformDetailTemplate";
import { notFound } from "next/navigation";

export const metadata = { title: "DeiBud - AI 케어 가이드 | BAYADA", description: "AI 기반 실시간 케어 가이드" };

export default async function DeiBudPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const platform = getPlatformBySlug("deibud");
  if (!platform) notFound();
  const dict = await getDictionary(locale as Locale);
  return <PlatformDetailTemplate platform={platform} dict={dict} locale={locale} />;
}
