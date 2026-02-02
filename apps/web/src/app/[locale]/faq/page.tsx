import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getFAQContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { FAQAccordion } from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 자주 묻는 질문",
};

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const faqContent = getFAQContent();

  return (
    <>
      <PageHero title={dict.web.faq.title} />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <FAQAccordion items={faqContent.items} />
        </Container>
      </section>
    </>
  );
}
