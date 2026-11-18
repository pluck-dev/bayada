import { getWebPageContent } from "@/lib/web-pages";
import { AudienceContent } from "@/components/shared/AudienceContent";
import { createMetadata } from "@/lib/seo";
import { SeniorClient } from "./SeniorClient";

export const metadata = createMetadata({ title: "시니어 서비스", description: "65세 이상 어르신을 위한 전문 홈헬스케어 서비스. 방문간호, 방문요양, 운동 지도, 시니어 리빙 솔루션을 제공합니다.", path: "/ko/who-we-serve/users/senior" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const segment = await getWebPageContent("audienceSenior");
  return <AudienceContent segment={segment}><SeniorClient locale={locale} /></AudienceContent>;
}
