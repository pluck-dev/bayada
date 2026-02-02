import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getHomeCareContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { PricingTable } from "@/components/services/PricingTable";
import { GradeLimitTable } from "@/components/services/GradeLimitTable";
import { ServiceList } from "@/components/services/ServiceList";

export const metadata: Metadata = {
  title: "방문요양 - 케어 기버 | BAYADA 홈헬스케어",
  description: "노련하고 친절한 요양보호사가 고객의 가정을 방문해 신체활동, 가사지원 등 요양관리 서비스를 제공합니다.",
};

export default async function HomeCarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getHomeCareContent();
  const t = dict.web.services;

  return (
    <>
      <PageHero
        title={data.title}
        subtitle={data.subtitle}
        backgroundImage="/images/services/home-care.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <p className="text-body-lg leading-relaxed text-[color:var(--muted)]">
                  {data.description}
                </p>
              </div>

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

              <div>
                <h3 className="mb-4 text-lg font-semibold text-[color:var(--fg)]">
                  {t.monthlyLimit}
                </h3>
                <GradeLimitTable dict={dict} rows={data.monthlyLimit2024} />
              </div>

              {data.notes && (
                <div className="rounded-xl border border-[color:var(--border)] bg-[#fffbeb] p-6">
                  <h4 className="text-sm font-semibold text-[#d97706]">참고사항</h4>
                  <ul className="mt-3 space-y-2">
                    {data.notes.map((note: string, i: number) => (
                      <li key={i} className="text-sm text-[color:var(--muted)]">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/images/services/home-care.jpg"
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
