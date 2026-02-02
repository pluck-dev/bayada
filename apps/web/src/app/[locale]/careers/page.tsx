import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "채용 정보 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 채용 정보",
};

const careers = [
  { id: "1", title: "전문 간호사 (Skilled Nursing)", dept: "케어서비스팀", location: "서울", type: "정규직", deadline: "2026-03-31", active: true },
  { id: "2", title: "요양보호사", dept: "케어서비스팀", location: "서울/경기", type: "정규직", deadline: "2026-03-31", active: true },
  { id: "3", title: "물리치료사", dept: "재활팀", location: "서울", type: "정규직", deadline: "2026-02-28", active: true },
  { id: "4", title: "케어 코디네이터", dept: "케어서비스팀", location: "서울", type: "정규직", deadline: "2026-03-15", active: true },
  { id: "5", title: "AI 엔지니어 (DeiBud)", dept: "플랫폼팀", location: "서울", type: "정규직", deadline: "2025-12-31", active: false },
];

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const active = careers.filter((c) => c.active);
  const closed = careers.filter((c) => !c.active);

  return (
    <>
      <PageHero title="Careers" subtitle="바야다와 함께 성장할 인재를 찾습니다" />
      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 모집 중 */}
          <h2 className="text-xl font-bold text-[color:var(--fg)]">모집 중인 공고</h2>
          <div className="mt-6 space-y-4">
            {active.map((job) => (
              <div key={job.id} className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[color:var(--fg)]">{job.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
                    <span>{job.dept}</span><span>·</span><span>{job.location}</span><span>·</span><span>{job.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">마감: {job.deadline}</p>
                </div>
                <Link href={`/${locale}/contact`} className="shrink-0 rounded-full bg-[#ce0e2d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#b00c27]">지원하기</Link>
              </div>
            ))}
          </div>

          {/* 마감 */}
          {closed.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-[color:var(--muted)]">마감된 공고</h2>
              <div className="mt-4 space-y-3">
                {closed.map((job) => (
                  <div key={job.id} className="rounded-xl border border-[color:var(--border)] p-4 opacity-50">
                    <h3 className="font-medium text-[color:var(--fg)]">{job.title}</h3>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{job.dept} · {job.location} · 마감: {job.deadline}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
