import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "Resources",
  description: "바야다홈헬스케어 리소스 센터. 가이드, 문서, 교육 자료를 확인하세요.",
  path: "/ko/resources",
});

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="Resources"
        subtitle="바야다홈헬스케어 가이드 및 자료 모음"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <NeedsReview
            label="수정필요"
            note="엑셀 시트: Resources (rows: 2, cols: 2) — 내용이 [B2] Resources 텍스트만 있음. bayada.com/resources 참고하여 실제 자료 목록 및 카테고리 채워야 함."
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  category: "가이드",
                  title: "홈헬스케어 이용 가이드",
                  desc: "처음 홈헬스케어를 시작하는 분들을 위한 단계별 안내서입니다.",
                  href: "#",
                  badge: "PDF",
                },
                {
                  category: "가이드",
                  title: "장기요양보험 신청 가이드",
                  desc: "노인장기요양보험 등급 신청부터 서비스 이용까지 안내합니다.",
                  href: "#",
                  badge: "PDF",
                },
                {
                  category: "교육",
                  title: "보호자를 위한 돌봄 교육",
                  desc: "가족 보호자가 알아야 할 기본 돌봄 방법과 응급 대처법을 소개합니다.",
                  href: "#",
                  badge: "동영상",
                },
                {
                  category: "양식",
                  title: "서비스 신청서",
                  desc: "바야다홈헬스케어 서비스 이용 신청에 필요한 서류를 다운로드하세요.",
                  href: "#",
                  badge: "PDF",
                },
                {
                  category: "양식",
                  title: "개인정보 수집·이용 동의서",
                  desc: "서비스 이용 시 필요한 개인정보 동의서 양식입니다.",
                  href: "#",
                  badge: "PDF",
                },
                {
                  category: "공지",
                  title: "Notice of Privacy Event",
                  desc: "개인정보 보호 이벤트 관련 공식 안내문입니다.",
                  href: "/documents/BAYADA_Website_Notice_FINAL_KOR.pdf",
                  badge: "PDF",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-2xl border border-[color:var(--border)] p-6 transition hover:border-[#ce0e2d]/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--muted)]">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-[#ce0e2d]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ce0e2d]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[color:var(--fg)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--muted)]">
                    {item.desc}
                  </p>
                  <span className="mt-4 text-sm font-medium text-[#ce0e2d]">
                    다운로드 →
                  </span>
                </a>
              ))}
            </div>
          </NeedsReview>
        </Container>
      </section>
    </>
  );
}
