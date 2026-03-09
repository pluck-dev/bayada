import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { getAboutContent } from "@/data/content";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@bayada/shared/i18n";
import { getDictionary } from "@bayada/shared/i18n";
import Link from "next/link";

export const metadata = createMetadata({
  title: "회사소개",
  description:
    "바야다홈헬스케어는 미국 최대 홈헬스케어 기업 BAYADA와 손잡고 최고의 방문 간호·돌봄 서비스를 제공합니다. 50년 글로벌 경험, The BAYADA Way 철학.",
  path: "/ko/about",
});

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const about = getAboutContent();

  /* BI/CI 정보 */
  const brandColors = [
    { name: "BAYADA Red", hex: "#CE0E2D", desc: "주요 브랜드 컬러" },
    { name: "Dark Navy", hex: "#1B2A4A", desc: "텍스트·배경" },
    { name: "White", hex: "#FFFFFF", desc: "배경·대비" },
    { name: "Warm Gray", hex: "#F5F5F0", desc: "서피스·보조" },
  ];

  /* 조직도 데이터 */
  const orgChart = {
    governance: "DEILEA.AI Governance",
    layers: [
      { name: "Global Core", desc: "글로벌 전략 수립" },
      { name: "JAPAC Regional", desc: "아시아태평양 지역 총괄" },
      { name: "Country Squads", desc: "한국 현지 운영" },
    ],
    xTeams: [
      { name: "Product x AI", desc: "DeiBud, Dtx 등 AI 제품" },
      { name: "Digital Platform x IT", desc: "DeiCloud, DeiEdu 플랫폼" },
      { name: "Compliance x Public Sector", desc: "규제·공공 대응" },
      { name: "GTM x Partnerships", desc: "시장 진출·파트너십" },
    ],
  };

  /* 인증·수상 현황 */
  const certifications = [
    {
      title: "노인장기요양보험 지정기관",
      desc: "국민건강보험공단 공식 지정 방문요양·방문간호 서비스 제공기관",
      year: "2024",
    },
    {
      title: "2025 엑설런스 인 헬스케어 어워드",
      desc: "홈헬스케어 분야 우수 서비스 품질 인정",
      year: "2025",
    },
    {
      title: "BAYADA 글로벌 인증",
      desc: "BAYADA International Quality Standards 충족",
      year: "2024",
    },
    {
      title: "ISO 9001 품질경영시스템",
      desc: "국제 품질경영 표준 인증 획득",
      year: "2024",
    },
  ];

  return (
    <>
      <PageHero
        title="About BAYADA"
        subtitle="바야다홈헬스케어를 소개합니다"
        backgroundImage="/images/about/banner.jpg"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 회사 소개 */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-display-sm font-bold text-[color:var(--fg)]">
                {about.heading}
              </h2>
              <div className="mt-6 space-y-4 text-body-lg leading-relaxed text-[color:var(--muted)]">
                {about.content
                  .split("\n\n")
                  .map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
              </div>
            </div>
            <div className="space-y-6">
              {/* <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/about/bayada001.png"
                  alt="BAYADA"
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover"
                />
              </div> */}
              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                  홈헬스케어란?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  {about.whatIsHomeHealthCare}
                </p>
              </div>
            </div>
          </div>

          {/* BI/CI 섹션 */}
          <div className="mt-20">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">
              BI/CI (Brand Identity / Corporate Identity)
            </h2>
            {/* 브랜드 메시지 & The BAYADA Way */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] p-8">
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                  브랜드 메시지
                </h3>
                <blockquote className="mt-4 border-l-4 border-[#ce0e2d] pl-4 text-sm italic leading-relaxed text-[color:var(--muted)]">
                  &quot;Compassion. Excellence. Reliability.&quot;
                </blockquote>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  바야다는 50년간 쌓아온 글로벌 노하우를 바탕으로, 모든 사람이
                  집에서 안전하고 행복한 생활을 누릴 수 있도록 최고의 홈헬스케어
                  서비스를 제공합니다.
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] p-8">
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                  The BAYADA Way
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#ce0e2d]">&#9679;</span>
                    고객의 안전과 행복을 최우선으로 합니다
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#ce0e2d]">&#9679;</span>
                    연민과 탁월함, 신뢰를 바탕으로 서비스합니다
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#ce0e2d]">&#9679;</span>
                    직원의 성장과 복지를 지원합니다
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#ce0e2d]">&#9679;</span>
                    지역사회에 기여하는 기업 시민이 됩니다
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 조직도 섹션 */}
          <div className="mt-20">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">조직도</h2>
            <div className="mt-8 rounded-2xl border border-[color:var(--border)] p-8">
              {/* 거버넌스 */}
              <div className="text-center">
                <div className="inline-block rounded-full bg-[#ce0e2d] px-6 py-2 text-sm font-bold text-white">
                  {orgChart.governance}
                </div>
              </div>

              {/* 계층 구조 */}
              <div className="mt-8 flex flex-col items-center gap-3">
                {orgChart.layers.map((layer, i) => (
                  <div key={layer.name} className="w-full max-w-md">
                    <div className="flex items-center gap-2">
                      {i > 0 && (
                        <div className="mx-auto mb-1 h-4 w-0.5 bg-[color:var(--border)]" />
                      )}
                    </div>
                    <div className="rounded-xl border border-[color:var(--border)] p-4 text-center">
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        {layer.name}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {layer.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 기능별 x-Teams */}
              <div className="mt-8">
                <p className="mb-4 text-center text-sm font-semibold text-[color:var(--fg)]">
                  4 Functional x-Teams
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {orgChart.xTeams.map((team) => (
                    <div
                      key={team.name}
                      className="rounded-xl bg-[color:var(--surface)] p-4 text-center"
                    >
                      <p className="text-sm font-medium text-[color:var(--fg)]">
                        {team.name}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {team.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 인증·수상 현황 */}
          <div className="mt-20">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">
              인증·수상 현황
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {certifications.map((cert) => (
                <div
                  key={cert.title}
                  className="rounded-2xl border border-[color:var(--border)] p-6"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-[color:var(--fg)]">
                      {cert.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[#ce0e2d]/10 px-3 py-1 text-xs font-medium text-[#ce0e2d]">
                      {cert.year}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {cert.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/partnership`}
              className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]"
            >
              제휴·파트너십 문의
            </Link>
            <Link
              href={`/${locale}/careers`}
              className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
            >
              채용 정보
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
