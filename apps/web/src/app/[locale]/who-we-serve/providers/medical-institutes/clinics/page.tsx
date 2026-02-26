import { createMetadata } from "@/lib/seo";
import ClinicsClient from "./ClinicsClient";

export const metadata = createMetadata({
  title: "클리닉 파트너십",
  description:
    "클리닉을 위한 BAYADA 협력 프로그램. 환자 지속관리와 가정 기반 케어 연계를 지원합니다.",
  path: "/ko/who-we-serve/providers/medical-institutes/clinics",
});

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ClinicsClient locale={locale} />;
}
