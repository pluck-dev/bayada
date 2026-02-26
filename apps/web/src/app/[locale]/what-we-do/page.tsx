import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { services } from "@/data/services";
import WhatWeDoClient from "./WhatWeDoClient";

export const metadata = createMetadata({
  title: "서비스 소개",
  description:
    "바야다가 제공하는 12가지 홈헬스케어 서비스 - 방문간호, 방문요양, 호스피스, 전환의료, 임상시험, 교육 등을 소개합니다.",
  path: "/ko/what-we-do",
});

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await getDictionary(locale as Locale);

  return <WhatWeDoClient services={services} locale={locale} />;
}
