import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { QualificationClient } from "./QualificationClient";

export const metadata = createMetadata({
  title: "파트너 자격 심사",
  description:
    "BAYADA 홈헬스케어 공식 파트너가 되세요. 의료기관, 전문 인력, 교육기관을 위한 자격 심사 절차와 혜택을 안내합니다.",
  path: "/ko/providers/qualification",
  keywords: [
    "BAYADA 파트너",
    "홈헬스케어 파트너십",
    "의료기관 파트너",
    "요양보호사 파트너",
    "파트너 자격 심사",
  ],
});

export default async function QualificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="Partner Qualification"
        subtitle="BAYADA 파트너 자격 심사 — 함께 최고의 홈헬스케어를 만들어 갑니다"
      />
      <QualificationClient locale={locale} />
    </>
  );
}
