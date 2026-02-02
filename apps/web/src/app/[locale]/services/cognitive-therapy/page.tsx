import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getCognitiveTherapyContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { ServiceList } from "@/components/services/ServiceList";

export const metadata: Metadata = {
  title: "통합인지요법 | BAYADA 홈헬스케어",
  description: "다양한 인지 자극을 통해 인지 저하를 늦추기 위한 전문 프로그램을 제공합니다.",
};

export default async function CognitiveTherapyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getCognitiveTherapyContent();
  const t = dict.web.services;

  return (
    <>
      <PageHero
        title={data.title}
        backgroundImage="/images/services/cognitive-therapy.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <p className="text-body-lg leading-relaxed text-[color:var(--muted)]">
                {data.description}
              </p>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[#2563eb]">전문가 협력</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.approach}</p>
              </div>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[#ce0e2d]">{t.target}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.targetUsers}</p>
              </div>

              <ServiceList items={data.activities} title={t.activities} />
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/images/services/cognitive-therapy.jpg"
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
