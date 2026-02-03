import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

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
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="What We Do"
        subtitle="바야다가 제공하는 12가지 홈헬스케어 서비스"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/${locale}/what-we-do/${service.slug}`}
                className="group relative rounded-2xl border border-[color:var(--border)] p-6 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
              >
                {service.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-medium text-[#ce0e2d]">
                    {service.badge}
                  </span>
                )}
                <span className="text-3xl">{service.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-[color:var(--fg)] transition-colors group-hover:text-[#ce0e2d]">
                  {service.nameEn}
                </h3>
                <p className="mt-1 text-sm font-medium text-[color:var(--muted)]">
                  {service.nameKo}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-[color:var(--muted)]">
                  {service.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-[#ce0e2d]">
                  자세히 보기 →
                </span>
              </Link>
            ))}
          </div>

          {/* 하단 CTA */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/contact`}
              className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
            >
              상담 신청하기
            </Link>
            <Link
              href={`/${locale}/membership`}
              className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
            >
              AI 상담 시작하기
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
