import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPlatformBySlug } from "@/data/platforms";
import { PlatformDetailTemplate } from "@/components/templates/PlatformDetailTemplate";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Dtx - 디지털 치료제", description: "BAYADA 디지털 치료제 플랫폼 Dtx. AI 기반 맞춤형 디지털 치료 솔루션을 제공합니다.", path: "/ko/platform/dtx" });

export default async function DtxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const platform = getPlatformBySlug("dtx");
  if (!platform) notFound();
  const dict = await getDictionary(locale as Locale);
  return <PlatformDetailTemplate platform={platform} dict={dict} locale={locale} />;
}
