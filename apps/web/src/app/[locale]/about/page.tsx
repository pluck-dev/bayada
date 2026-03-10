import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { NeedsReview } from "@/components/shared/NeedsReview";
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

          {/* The BAYADA Way 전용 섹션 */}
          <div className="mt-20">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">
              The BAYADA Way
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* 고객이 최우선 */}
              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <div className="mb-4 inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                    우리의 고객이 최우선입니다
                  </h3>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  <p>
                    우리 돌봄의 중심에는 고객과 돌봄 제공자 사이의 관계가
                    있습니다. 연민, 탁월함, 그리고 신뢰를 나침반 삼아 우리는
                    진정한 희망을 키우고, 건강한 삶의 기반을 만들어갑니다.
                  </p>
                  <p>
                    고객과 돌봄 제공자는 함께 도전을 헤쳐 나가고, 성취를 함께
                    기뻐하며, 신뢰와 편안함, 그리고 역량 강화의 여정을 함께
                    만들어갑니다.
                  </p>
                </div>
              </div>
              {/* 차별화 요소 */}
              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <div className="mb-4 inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                    2
                  </span>
                  <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                    우리를 하나로 묶으면서도 차별화합니다
                  </h3>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  <p>
                    The BAYADA Way는 재가·홈 헬스케어 전문가로서 우리의 일에
                    가장 중요한 가치가 무엇인지를 담고 있습니다.
                  </p>
                  <p>
                    이는 현재 세대의 BAYADA 홈 헬스케어 전문가들이 정립한
                    철학이자 지침이며, 앞으로 이 중요한 사명을 이어갈 동료들에게
                    전해질 신념의 체계입니다.
                  </p>
                </div>
              </div>
            </div>
            {/* 3대 핵심 가치 */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  value: "Compassion",
                  label: "연민",
                  desc: "진심 어린 공감으로 고객의 곁에 함께합니다",
                },
                {
                  value: "Excellence",
                  label: "탁월함",
                  desc: "최고 수준의 전문성으로 최선의 돌봄을 제공합니다",
                },
                {
                  value: "Reliability",
                  label: "신뢰",
                  desc: "언제나 약속을 지키며 믿을 수 있는 파트너가 됩니다",
                },
              ].map((item) => (
                <div
                  key={item.value}
                  className="rounded-2xl border border-[#ce0e2d]/20 p-6 text-center"
                >
                  <p className="text-2xl font-bold text-[#ce0e2d]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[color:var(--fg)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* BAYADA 50년 히스토리 */}
          <NeedsReview
            label="수정필요"
            note="바야다 공홈 참고 / 정확한 연도 확인 필요"
          >
            <div className="mt-20">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">
                BAYADA 50년의 역사
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                50년간의 헌신과 혁신으로 세계 최고의 홈헬스케어 기업이
                되었습니다
              </p>
              <div className="mt-8 space-y-0">
                {[
                  {
                    year: "1975",
                    title: "BAYADA 설립",
                    desc: "미국 필라델피아에서 Mark Baiada가 설립. 단 한 명의 간호사와 함께 시작한 작은 가정 방문 간호 서비스가 오늘날 세계 최대 홈헬스케어 기업의 출발점이 되었습니다.",
                  },
                  {
                    year: "2015",
                    title: "글로벌 확장 시작",
                    desc: "미국을 넘어 아시아·태평양, 유럽 등 글로벌 시장으로 진출을 본격화하며 국제적인 홈헬스케어 네트워크를 구축하기 시작했습니다.",
                  },
                  {
                    year: "2023",
                    title: "한국 법인 설립",
                    desc: "바야다홈헬스케어 한국 법인을 설립하며 아시아 태평양 지역 거점을 강화했습니다. 50년의 글로벌 노하우를 한국에 이식하는 첫 걸음을 내딛었습니다.",
                  },
                  {
                    year: "2024",
                    title: "한국 서비스 런칭",
                    desc: "방문요양·방문간호 서비스를 정식 런칭. 노인장기요양보험 지정기관으로 등록하여 국내 홈헬스케어 시장에 본격 진입했습니다.",
                  },
                ].map((item, i, arr) => (
                  <div key={item.year} className="flex gap-6">
                    {/* 타임라인 축 */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                        &#9679;
                      </div>
                      {i < arr.length - 1 && (
                        <div className="mt-1 w-0.5 flex-1 bg-[color:var(--border)]" />
                      )}
                    </div>
                    {/* 내용 */}
                    <div className={i < arr.length - 1 ? "pb-8" : ""}>
                      <span className="inline-block rounded-full bg-[#ce0e2d]/10 px-3 py-0.5 text-xs font-semibold text-[#ce0e2d]">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-[color:var(--fg)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeedsReview>

          {/* 글로벌 네트워크 */}
          <NeedsReview
            label="수정필요"
            note="바야다 공홈 참고 / 수치 확인 필요"
          >
            <div className="mt-20">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">
                글로벌 네트워크
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                전 세계에서 믿음으로 연결된 BAYADA의 네트워크
              </p>
              {/* 핵심 수치 */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  {
                    stat: "360+",
                    label: "전 세계 사무소",
                    desc: "미국, 아시아, 유럽 전역",
                  },
                  {
                    stat: "33,000+",
                    label: "전문 인력",
                    desc: "간호사·요양사·치료사 등",
                  },
                  {
                    stat: "9개국",
                    label: "운영 국가",
                    desc: "글로벌 홈헬스케어 리더",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-[color:var(--surface)] p-8 text-center"
                  >
                    <p className="text-4xl font-extrabold text-[#ce0e2d]">
                      {item.stat}
                    </p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--fg)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              {/* 운영 국가 목록 */}
              <div className="mt-8 rounded-2xl border border-[color:var(--border)] p-8">
                <h3 className="mb-4 text-sm font-semibold text-[color:var(--fg)]">
                  운영 국가
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { flag: "🇺🇸", name: "미국" },
                    { flag: "🇰🇷", name: "한국" },
                    { flag: "🇯🇵", name: "일본" },
                    { flag: "🇮🇳", name: "인도" },
                    { flag: "🇦🇺", name: "호주" },
                    { flag: "🇳🇿", name: "뉴질랜드" },
                    { flag: "🇩🇪", name: "독일" },
                    { flag: "🇮🇪", name: "아일랜드" },
                    { flag: "🇨🇦", name: "캐나다" },
                  ].map((country) => (
                    <span
                      key={country.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--fg)]"
                    >
                      {country.flag} {country.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </NeedsReview>

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
