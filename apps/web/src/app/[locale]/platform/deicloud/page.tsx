import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPlatformBySlug } from "@/data/platforms";
import { PlatformDetailTemplate } from "@/components/templates/PlatformDetailTemplate";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "DeiCloud - 운영 SaaS", description: "서비스 제공기관을 위한 운영 관리 SaaS 플랫폼 DeiCloud. 스케줄링, 인력 관리, 품질 관리를 한 곳에서.", path: "/ko/platform/deicloud" });

export default async function DeiCloudPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const platform = getPlatformBySlug("deicloud");
  if (!platform) notFound();
  const dict = await getDictionary(locale as Locale);
  return <PlatformDetailTemplate platform={platform} dict={dict} locale={locale} />;
}
