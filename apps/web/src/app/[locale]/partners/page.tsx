import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPartnerLogos } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "파트너 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어와 함께하는 국내외 주요 의료기관 및 글로벌 기업",
};

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const partners = getPartnerLogos();

  return (
    <>
      <PageHero
        title={dict.web.partners.title}
        subtitle="국내외 주요 의료기관 및 글로벌 기업과 협력합니다"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center justify-center rounded-xl border border-[color:var(--border)] bg-white p-6 transition-all hover:shadow-[var(--shadow-medium)] hover:border-transparent"
              >
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={120}
                  height={60}
                  className="h-auto max-h-12 w-auto max-w-[100px] object-contain"
                />
                <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
