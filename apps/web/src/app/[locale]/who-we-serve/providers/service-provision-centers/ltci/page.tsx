import { getWebPageContent } from "@/lib/web-pages";
import { AudienceContent } from "@/components/shared/AudienceContent";
import { createMetadata } from "@/lib/seo";
import { LtciClient } from "./LtciClient";

export const metadata = createMetadata({ title: "장기요양 제공기관", description: "장기요양 서비스 제공기관을 위한 BAYADA 파트너십. 품질 관리, 인력 교육, 운영 효율화를 지원합니다.", path: "/ko/who-we-serve/providers/service-provision-centers/ltci" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = await getWebPageContent("audienceLtci");
  return <AudienceContent segment={segment}><LtciClient locale={locale} /></AudienceContent>;
}
