import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { getPartnerLogos } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { CTABanner } from "@/components/shared/CTABanner";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "파트너십",
  description:
    "50년 글로벌 헬스케어 경험과 함께 성장하세요. 병원, 클리닉, 제약사, 지자체와의 전략적 파트너십을 제안합니다.",
  path: "/ko/partnership",
});

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

          {/* Senior Living Solutions */}
          <NeedsReview
            label="수정필요"
            note="bayada.com Senior Living Solutions 페이지 참고하여 상세 내용 보완 필요"
          >
            <div className="mt-12 rounded-2xl border border-[color:var(--border)] p-8">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">Senior Living Solutions</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                BAYADA는 시니어 생활 커뮤니티, 요양원, 지원 생활 시설과 협력하여 입주자에게
                전문적인 재가 케어 서비스를 제공합니다. 시설 내 케어 역량을 강화하고 입주자
                만족도를 높이는 맞춤형 파트너십 프로그램을 운영합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { title: "전문 간호 서비스", desc: "시설 내 전문 간호사 파견 및 건강관리 지원" },
                  { title: "재활 치료 서비스", desc: "물리치료, 작업치료, 언어치료 등 재활 프로그램" },
                  { title: "호스피스 케어", desc: "존엄한 말기 케어와 가족 지원 서비스" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl bg-[color:var(--surface)] p-4">
                    <h3 className="font-semibold text-[color:var(--fg)] text-sm">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--muted)]">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/contact`} className="mt-5 inline-block text-sm font-medium text-[#ce0e2d]">
                Senior Living Solutions 문의하기 →
              </Link>
            </div>
          </NeedsReview>

          {/* Partner with BAYADA */}
          <NeedsReview
            label="수정필요"
            note="bayada.com Partner with BAYADA 페이지 참고하여 상세 내용 보완 필요"
          >
            <div className="mt-8 rounded-2xl border border-[color:var(--border)] p-8">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">Partner with BAYADA</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                50년 글로벌 홈헬스케어 경험을 바탕으로 병원, 클리닉, 의료기관과 전략적
                파트너십을 구축합니다. 퇴원 후 재가 케어 연계, 지역사회 헬스케어 네트워크
                확장, 공동 품질관리 프로그램 운영 등 다양한 협력 모델을 제안합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "퇴원 환자 재가 케어 연계 프로그램",
                  "공동 케어 코디네이션 시스템",
                  "임상 교육 및 역량 강화 프로그램",
                  "품질관리 및 성과 모니터링 지원",
                  "지역사회 헬스케어 네트워크 참여",
                  "BAYADA 글로벌 기준 인증 지원",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <span className="text-[#ce0e2d]">✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/contact`} className="mt-5 inline-block text-sm font-medium text-[#ce0e2d]">
                파트너십 신청하기 →
              </Link>
            </div>
          </NeedsReview>

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
