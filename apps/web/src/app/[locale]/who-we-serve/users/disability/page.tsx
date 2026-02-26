import { createMetadata } from "@/lib/seo";
import { DisabilityClient } from "./DisabilityClient";

export const metadata = createMetadata({ title: "장애인 케어", description: "장애인을 위한 맞춤 홈헬스케어 서비스. 일상생활 지원, 재활 운동, 전문 간호를 가정에서 제공합니다.", path: "/ko/who-we-serve/users/disability" });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DisabilityClient locale={locale} />;
}
