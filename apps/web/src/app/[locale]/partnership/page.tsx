import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getPartnerLogos } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { CTABanner } from "@/components/shared/CTABanner";

export const metadata: Metadata = {
  title: "Partnership | BAYADA 홈헬스케어",
  description: "50년 글로벌 헬스케어 경험과 함께 성장하세요",
};

export default async function PartnershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const partners = getPartnerLogos();

  const types = [
    { name: "서비스 파트너십", en: "Service Partnership", desc: "서비스 제공기관 네트워크 참여", icon: "🤝" },
    { name: "기술 파트너십", en: "Tech Partnership", desc: "디지털 헬스케어 솔루션 연계", icon: "💻" },
    { name: "공공 파트너십", en: "Public Partnership", desc: "지자체·공공기관 품질관리 컨설팅", icon: "🏛️" },
  ];

  return (
    <>
      <PageHero title="BAYADA Partnership" subtitle="50년 글로벌 헬스케어 경험과 함께 성장하세요" />
      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 브랜드 소개 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-8 mb-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">BAYADA Home Health Care</h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              1975년 설립, 미국 최대 홈헬스케어 기업. 33,000+ 직원, 360+ 오피스. 한국 진출을 통해 아시아 시장을 선도하고 있습니다.
            </p>
          </div>

          {/* 파트너십 유형 */}
          <h2 className="text-xl font-bold text-[color:var(--fg)]">파트너십 유형</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {types.map((t) => (
              <div key={t.en} className="rounded-2xl border border-[color:var(--border)] p-6">
                <span className="text-3xl">{t.icon}</span>
                <h3 className="mt-3 font-bold text-[color:var(--fg)]">{t.name}</h3>
                <p className="text-xs text-[color:var(--muted)]">{t.en}</p>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{t.desc}</p>
                <Link href={`/${locale}/contact`} className="mt-4 inline-block text-sm font-medium text-[#ce0e2d]">문의하기 →</Link>
              </div>
            ))}
          </div>

          {/* 파트너 혜택 */}
          <div className="mt-12 rounded-2xl bg-[color:var(--surface)] p-8">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">파트너 혜택</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["BAYADA 브랜드 네트워크 참여", "운영 컨설팅", "교육 프로그램", "품질관리 시스템", "인증 지원", "글로벌 네트워크 접근"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                  <span className="text-[#ce0e2d]">✓</span> {b}
                </div>
              ))}
            </div>
          </div>

          {/* 파트너 로고 */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">BAYADA 파트너 기관</h2>
            <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {partners.slice(0, 12).map((p) => (
                <div key={p.name} className="flex items-center justify-center rounded-xl border border-[color:var(--border)] p-4">
                  <span className="text-xs text-[color:var(--muted)]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <CTABanner
              title="파트너십 문의하기"
              description="BAYADA와 함께 성장할 파트너를 찾고 있습니다"
              primaryLabel="파트너십 문의"
              primaryHref={`/${locale}/contact`}
              variant="brand"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
