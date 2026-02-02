import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getVisitingNursingContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { PricingTable } from "@/components/services/PricingTable";
import { ServiceList } from "@/components/services/ServiceList";

export const metadata: Metadata = {
  title: "방문간호 - 케어 메이트 | BAYADA 홈헬스케어",
  description: "간호사(RN)가 고객의 가정을 방문해 의사의 방문간호지시서에 따른 간호, 진료보조, 구강관리, 요양상담을 제공합니다.",
};

export default async function VisitingNursingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getVisitingNursingContent();
  const t = dict.web.services;

  return (
    <>
      <PageHero
        title={data.title}
        subtitle={data.subtitle}
        backgroundImage="/images/services/visiting-nursing.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <p className="text-body-lg leading-relaxed text-[color:var(--muted)]">
                {data.description}
              </p>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[#ce0e2d]">{t.target}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.targetUsers}</p>
              </div>

              <ServiceList items={data.mainServices} title={t.mainServices} />

              <div>
                <h3 className="mb-4 text-lg font-semibold text-[color:var(--fg)]">
                  {t.pricing} (2024)
                </h3>
                <PricingTable dict={dict} rows={data.pricing2024.perVisit} />
              </div>
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/images/services/visiting-nursing.jpg"
                    alt={data.title}
                    width={400}
                    height={300}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#ce0e2d] to-[#a80b24] p-6 text-white">
                  <p className="text-sm font-medium">상담 전화</p>
                  <a href="tel:1670-1379" className="mt-1 block text-2xl font-bold">
                    1670-1379
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
