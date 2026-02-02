import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { providerSegments } from "@/data/audiences";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "서비스 제공자 | BAYADA 홈헬스케어",
  description: "BAYADA 네트워크와 함께 성장하세요. 50년 글로벌 경험 기반 파트너십",
};

export default async function ProvidersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  // 카테고리별 그룹핑
  const professionals = providerSegments.filter(
    (s) => s.slug === "healthcare-professionals" || s.slug === "other-professionals"
  );
  const medicalInstitutes = providerSegments.filter(
    (s) => s.slug === "hospitals" || s.slug === "clinics"
  );
  const serviceProvision = providerSegments.filter(
    (s) => s.slug === "ltci-center" || s.slug === "nursing-visit-center" || s.slug === "daycare"
  );
  const government = providerSegments.find((s) => s.slug === "local-government");

  return (
    <>
      <PageHero
        title="Who We Serve — Providers"
        subtitle="BAYADA 네트워크와 함께 성장하세요"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          {/* CTA */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/onboarding/paid`}
              className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
            >
              유료 멤버십 시작
            </Link>
            <Link
              href={`/${locale}/onboarding/free`}
              className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
            >
              무료로 시작
            </Link>
          </div>

          {/* Professionals */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">Professionals</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {professionals.map((seg) => (
                <Link
                  key={seg.slug}
                  href={`/${locale}${seg.href}`}
                  className="group rounded-2xl border border-[color:var(--border)] p-6 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
                >
                  <span className="text-3xl">{seg.icon}</span>
                  <h3 className="mt-3 text-lg font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                    {seg.nameEn}
                  </h3>
                  <p className="text-sm text-[color:var(--muted)]">{seg.nameKo}</p>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">{seg.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-[#ce0e2d]">
                    {seg.ctaLabel} →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Medical Institutes */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">Medical Institutes</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {medicalInstitutes.map((seg) => (
                <Link
                  key={seg.slug}
                  href={`/${locale}${seg.href}`}
                  className="group rounded-2xl border border-[color:var(--border)] p-6 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
                >
                  <span className="text-3xl">{seg.icon}</span>
                  <h3 className="mt-3 text-lg font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                    {seg.nameEn}
                  </h3>
                  <p className="text-sm text-[color:var(--muted)]">{seg.nameKo}</p>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">{seg.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-[#ce0e2d]">
                    {seg.ctaLabel} →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Service Provision Centers */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">Service Provision Centers</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {serviceProvision.map((seg) => (
                <Link
                  key={seg.slug}
                  href={`/${locale}${seg.href}`}
                  className="group rounded-2xl border border-[color:var(--border)] p-6 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
                >
                  <span className="text-3xl">{seg.icon}</span>
                  <h3 className="mt-3 font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                    {seg.nameEn}
                  </h3>
                  <p className="text-sm text-[color:var(--muted)]">{seg.nameKo}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-[#ce0e2d]">
                    {seg.ctaLabel} →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Local Government */}
          {government && (
            <div className="rounded-2xl bg-[color:var(--surface)] p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="text-3xl">{government.icon}</span>
                  <h2 className="mt-3 text-xl font-bold text-[color:var(--fg)]">
                    {government.nameEn}
                  </h2>
                  <p className="text-sm text-[color:var(--muted)]">{government.nameKo}</p>
                  <p className="mt-3 max-w-lg text-sm text-[color:var(--muted)]">
                    {government.description}
                  </p>
                </div>
                <Link
                  href={`/${locale}${government.href}`}
                  className="shrink-0 rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
                >
                  {government.ctaLabel}
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
