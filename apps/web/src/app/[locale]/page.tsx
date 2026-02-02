import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { HeroSection } from "@/components/home/HeroSection";
import { BayadaWaySection } from "@/components/home/BayadaWaySection";
import { TimelineSection } from "@/components/home/TimelineSection";
import { ServiceAreaMap } from "@/components/home/ServiceAreaMap";
import { KeyNumbers } from "@/components/home/KeyNumbers";
import { WhyBayada } from "@/components/home/WhyBayada";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { LatestBlog } from "@/components/home/LatestBlog";
import { AcademyCTA } from "@/components/home/AcademyCTA";

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
      <BayadaWaySection />
      <TimelineSection />
      <ServiceAreaMap />
      <KeyNumbers />
      <WhyBayada />
      <ReviewsCarousel />
      <LatestBlog locale={locale} />
      <AcademyCTA locale={locale} />
    </>
  );
}
