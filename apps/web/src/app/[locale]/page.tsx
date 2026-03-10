import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesByAge } from "@/components/home/ServicesByAge";
import { BayadaWaySection } from "@/components/home/BayadaWaySection";
import { ServiceAreaMap } from "@/components/home/ServiceAreaMap";
import { WhyBayada } from "@/components/home/WhyBayada";
import { KeyNumbers } from "@/components/home/KeyNumbers";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { AcademyCTA } from "@/components/home/AcademyCTA";
import { Certifications } from "@/components/home/Certifications";
import { LatestBlog } from "@/components/home/LatestBlog";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스",
  description:
    "BAYADA 홈헬스케어는 방문간호, 방문요양, 전환의료, 교육 등 12가지 전문 홈헬스케어 서비스를 제공합니다. 50년 글로벌 노하우를 한국에서 만나보세요.",
  path: "/ko",
  absoluteTitle: true,
  keywords: [
    "홈헬스케어",
    "방문간호",
    "방문요양",
    "BAYADA",
    "바야다",
    "시니어 케어",
    "노인장기요양",
    "전환의료",
    "돌봄 서비스",
  ],
});

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <HeroSection locale={locale} />
      <ServicesByAge locale={locale} />
      <BayadaWaySection />
      <ServiceAreaMap />
      <WhyBayada />
      <NeedsReview label="엑셀 명세 없음" note="키 넘버 섹션 — 엑셀 명세서에 해당 섹션이 없습니다. 콘텐츠 확인 필요">
        <KeyNumbers />
      </NeedsReview>
      <NeedsReview label="엑셀 명세 없음" note="고객 후기 섹션 — 엑셀 명세서에 해당 섹션이 없습니다. 콘텐츠 확인 필요">
        <ReviewsCarousel />
      </NeedsReview>
      <NeedsReview label="엑셀 명세 없음" note="채용 CTA 섹션 — 엑셀 명세서에 해당 섹션이 없습니다. 콘텐츠 확인 필요">
        <AcademyCTA locale={locale} />
      </NeedsReview>
      <NeedsReview label="엑셀 명세 없음" note="인증 배지 섹션 — 미국 인증 기준, 한국 인증으로 교체 필요">
        <Certifications />
      </NeedsReview>
      <NeedsReview label="엑셀 명세 없음" note="블로그 섹션 — 엑셀 명세서에 해당 섹션이 없습니다. 콘텐츠 확인 필요">
        <LatestBlog locale={locale} />
      </NeedsReview>
    </>
  );
}
