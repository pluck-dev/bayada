import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "유료 멤버십 온보딩 | BAYADA", description: "맞춤 서비스 설계를 시작합니다" };

export default async function PaidOnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const steps = ["라이프스타일 설문", "건강 정보 입력", "맞춤 결과 확인", "서비스 디자인 제안", "서비스 신청"];

  return (
    <>
      <PageHero title="맞춤 서비스 설계" subtitle="5단계로 나만의 케어 플랜을 만들어보세요" />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          {/* 스텝 인디케이터 */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-[#ce0e2d] text-white" : "bg-[color:var(--surface)] text-[color:var(--muted)]"}`}>{i + 1}</div>
                {i < steps.length - 1 && <div className="h-0.5 w-8 bg-[color:var(--border)]" />}
              </div>
            ))}
          </div>

          {/* Step 1 폼 */}
          <div className="rounded-2xl border border-[color:var(--border)] p-8">
            <h2 className="text-lg font-bold text-[color:var(--fg)]">Step 1: {steps[0]}</h2>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">거주 형태 *</label>
                <div className="mt-2 flex gap-4 text-sm">
                  {["독거", "가족동거", "시설"].map((o) => (
                    <label key={o} className="flex items-center gap-1.5"><input type="radio" name="living" className="accent-[#ce0e2d]" /> {o}</label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">일상 활동 수준 *</label>
                <div className="mt-2 flex gap-4 text-sm">
                  {["독립", "부분도움", "전적도움"].map((o) => (
                    <label key={o} className="flex items-center gap-1.5"><input type="radio" name="activity" className="accent-[#ce0e2d]" /> {o}</label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">주요 관심사 * (복수 선택)</label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {["만성질환 관리", "재활/운동", "영양/식단", "정서적 지원", "인지 훈련", "가사 지원", "응급 관리", "기타"].map((o) => (
                    <label key={o} className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#ce0e2d]" /> {o}</label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">케어 필요 빈도 *</label>
                <div className="mt-2 flex gap-4 text-sm">
                  {["매일", "주 2-3회", "주 1회"].map((o) => (
                    <label key={o} className="flex items-center gap-1.5"><input type="radio" name="freq" className="accent-[#ce0e2d]" /> {o}</label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]">다음 단계 →</button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
