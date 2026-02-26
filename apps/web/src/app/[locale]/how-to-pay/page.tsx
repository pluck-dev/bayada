import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { HowToPayClient } from "./HowToPayClient";

export const metadata = createMetadata({
  title: "홈케어 비용 안내",
  description:
    "노인장기요양보험, 국민건강보험, 민간보험 등 다양한 지원 제도를 활용하여 합리적인 비용으로 바야다 홈케어 서비스를 이용하세요.",
  path: "/ko/how-to-pay",
  keywords: [
    "홈케어 비용",
    "노인장기요양보험",
    "가정간호 보험",
    "홈케어 지원제도",
    "바야다 비용",
  ],
});

export default async function HowToPayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        title="홈케어 비용 안내"
        subtitle="다양한 지원 제도를 활용하여 합리적인 비용으로 서비스를 이용하세요"
      />
      <HowToPayClient locale={locale} />
    </>
  );
}
