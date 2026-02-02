import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import {
  getAllServices,
  getBayadaWayContent,
  getUsageGuideContent,
  getFAQContent,
  getPartnerLogos,
} from "@/data/content";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { BayadaWayPreview } from "@/components/home/BayadaWayPreview";
import { UsageSteps } from "@/components/home/UsageSteps";
import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { FAQPreview } from "@/components/home/FAQPreview";
import { CTASection } from "@/components/home/CTASection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const services = getAllServices();
  const bayadaWay = getBayadaWayContent();
  const usageGuide = getUsageGuideContent();
  const faqContent = getFAQContent();
  const partners = getPartnerLogos();

  return (
    <>
      <HeroSection dict={dict} locale={locale} />
      <StatsSection dict={dict} />
      <ServicesOverview dict={dict} locale={locale} services={services} />
      <BayadaWayPreview dict={dict} bayadaWay={bayadaWay} />
      <UsageSteps dict={dict} steps={usageGuide.steps} />
      <PartnersMarquee dict={dict} partners={partners} />
      <FAQPreview dict={dict} locale={locale} items={faqContent.items} />
      <CTASection dict={dict} locale={locale} />
    </>
  );
}
