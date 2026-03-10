import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";
import Link from "next/link";

export const metadata = createMetadata({
  title: "스마트하고 보다 안전한 홈케어",
  description:
    "BAYADA의 Enhanced Quality of Care 모델 — 예측 기반 위험 모니터링과 간호사의 일일 임상 감독을 결합한 스마트 돌봄 서비스",
  path: "/ko/smart-care",
});

export default async function SmartCarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        title="Smarter, Safer Home Care"
        subtitle="더 스마트하고, 더 안전한 바야다 통합 돌봄"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 메인 소개 */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
              Enhanced Quality of Care
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[color:var(--muted)]">
              BAYADA의 Enhanced Quality of Care(고도화된 품질 관리 모델)은
              예측 기반 위험 모니터링과 간호사의 일일 임상 감독을 결합하여
              안전성을 높이고, 불필요한 입원을 줄이며, 돌봄의 질을 향상시킵니다.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--muted)]">
              50년 이상 BAYADA는 재가 돌봄 분야의 선도 기관으로서
              어르신과 가족이 집에서 안전하고 편안하게 생활할 수 있도록 지원해 왔습니다.
            </p>
          </div>

          {/* 데이터 + 임상 감독 + AI 모델 */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-[color:var(--fg)] text-center mb-8">
              데이터 + 임상 감독 + AI = 더 나은 결과
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "데이터 기반 모니터링",
                  desc: "40개 이상의 돌봄 지표를 매일 점검",
                  icon: "📊",
                },
                {
                  title: "간호사 임상 감독",
                  desc: "등록 간호사가 위험 신호를 조기에 발견",
                  icon: "👩‍⚕️",
                },
                {
                  title: "AI 기반 통합 분석",
                  desc: "작은 변화들을 연결해 전체적인 위험도를 분석",
                  icon: "🤖",
                },
                {
                  title: "선제적 소통",
                  desc: "필요 시 돌봄 계획 조정 권고",
                  icon: "📞",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[color:var(--border)] p-6 text-center"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="mt-3 font-bold text-[color:var(--fg)]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 결과 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-8 mb-16 text-center">
            <h3 className="text-xl font-bold text-[color:var(--fg)]">
              지능형 예방 중심 돌봄을 통해
            </h3>
            <p className="mt-3 text-base text-[color:var(--muted)]">
              안정성과 가족의 안심을 동시에 제공합니다.
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-6 inline-block rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]"
            >
              문의하기
            </Link>
          </div>

          {/* 파트너십 섹션 */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-[color:var(--fg)] text-center mb-8">
              안전을 최우선으로 생각하는 전문가와의 파트너십
            </h3>
            <p className="text-center text-base text-[color:var(--muted)] max-w-2xl mx-auto mb-8">
              Enhanced Quality of Care 모델은
              가족이 신뢰하는 의료·돌봄 전문가를 지원하기 위해 설계되었습니다.
              데이터 기반 관리, 간호 전문성, 따뜻한 돌봄을 결합하여
              환자와 입소자의 안전성과 만족도를 높입니다.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  title: "시니어 거주 요양시설 연계",
                  subtitle: "Senior Living Communities",
                  benefit: "선제적 소통과 위험 관리로 어르신의 안전을 강화하고 가족의 불안을 줄입니다.",
                  value: "시설 및 지역사회 돌봄 모델과 유기적으로 연계되어 책임 위험을 낮추고, 입원율을 줄이며, 이용자 만족도를 향상시킵니다.",
                },
                {
                  title: "병원 퇴원 계획 지원",
                  subtitle: "Discharge Planner",
                  benefit: "퇴원 후 빠르고 안정적인 가정 복귀 지원",
                  value: "일일 모니터링과 조기 개입을 통해 재입원을 줄이고, 의료기관의 질 지표 개선을 지원합니다.",
                },
                {
                  title: "케어매니저",
                  subtitle: "Care Manager",
                  benefit: "근거 기반 데이터로 돌봄 계획을 지원",
                  value: "50년간 축적된 경험과 데이터 기반 관리 체계로 가정에서도 가장 안전하고 선제적인 돌봄을 제공합니다.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[color:var(--border)] p-6"
                >
                  <h4 className="font-bold text-[color:var(--fg)]">{card.title}</h4>
                  <p className="text-xs text-[color:var(--muted)] mt-1">{card.subtitle}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-[color:var(--fg)]">
                      <span className="font-semibold text-[#ce0e2d]">장점: </span>
                      {card.benefit}
                    </p>
                    <p className="text-sm text-[color:var(--muted)]">
                      <span className="font-semibold text-[color:var(--fg)]">가치: </span>
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-block rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]"
              >
                의뢰 요청하기
              </Link>
            </div>
          </div>

          {/* 개인별 맞춤 방문요양 서비스 */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
              개인별 맞춤 방문요양 서비스
            </h3>
            <p className="text-base text-[color:var(--muted)] mb-6">
              모든 이용자는 서로 다른 필요와 선호를 가지고 있습니다.
              BAYADA는 주 몇 시간 방문부터 24시간 상주 지원까지
              가족 상황에 맞춘 유연한 돌봄 서비스를 제공합니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "옷 입기, 세면, 목욕, 화장실 이용 등 신체활동 지원",
                "보행 보조, 휠체어 이동, 침상 이동 지원",
                "식단 계획 및 식사 준비",
                "복약 알림",
                "치매 및 기억력 저하 지원",
                "정서적 동행 및 사회적 교류",
                "간단한 가사 지원 및 세탁",
                "장보기 및 병원·약국 동행",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-[color:var(--surface)] p-4"
                >
                  <span className="mt-0.5 text-[#ce0e2d] shrink-0">&#9679;</span>
                  <span className="text-sm text-[color:var(--fg)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 뉴스/블로그 연결 */}
          <NeedsReview label="수정필요" note="바야다 공홈 참고 / 실제 블로그 콘텐츠 연결 필요">
            <div className="mb-16">
              <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
                맞춤형 소식 알림
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  "BAYADA AI 기반 재가 돌봄 모델 — 집에서 더 안전하게",
                  "AI와 간호사 감독을 결합하여 낙상을 예방하고 입원을 줄이는 혁신 모델",
                  "시니어 주거시설 관리자 대상 예측형 재가 돌봄 서비스",
                ].map((title) => (
                  <div
                    key={title}
                    className="rounded-xl border border-[color:var(--border)] p-5"
                  >
                    <p className="text-sm font-medium text-[color:var(--fg)]">
                      {title}
                    </p>
                    <Link
                      href={`/${locale}/blog`}
                      className="mt-3 inline-block text-xs font-medium text-[#ce0e2d]"
                    >
                      자세히 보기 →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </NeedsReview>

          {/* 검증된 성과 */}
          <NeedsReview label="수정필요" note="실제 환자/가족 경험담 필요">
            <div className="mb-16">
              <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
                검증된 성과
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-sm italic text-[color:var(--muted)] leading-relaxed">
                    &quot;BAYADA의 스마트 모니터링 덕분에 어머니의 건강 변화를 조기에 발견할 수 있었습니다.
                    응급실 방문 없이 가정에서 안전하게 관리할 수 있어 정말 감사합니다.&quot;
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[color:var(--fg)]">— 이용자 가족</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-sm italic text-[color:var(--muted)] leading-relaxed">
                    &quot;데이터 기반 관리 체계와 간호사 감독이 결합되어,
                    시설 입소자들의 안전성과 만족도가 크게 향상되었습니다.&quot;
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[color:var(--fg)]">— 파트너 시설 관계자</p>
                </div>
              </div>
            </div>
          </NeedsReview>

          {/* 하단 CTA */}
          <NeedsReview label="수정필요" note="바야다 공홈 참고 / 연계 지점 지도 필요">
            <div className="rounded-2xl bg-[color:var(--surface)] p-8 text-center">
              <h3 className="text-xl font-bold text-[color:var(--fg)]">
                가까운 BAYADA 센터와 상담하세요
              </h3>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                의뢰 또는 서비스 상담을 원하시면 가까운 방문요양 지점으로 문의해 주세요.
              </p>
              <Link
                href={`/${locale}/find-care`}
                className="mt-6 inline-block rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]"
              >
                가까운 센터 찾기
              </Link>
            </div>
          </NeedsReview>
        </Container>
      </section>
    </>
  );
}
