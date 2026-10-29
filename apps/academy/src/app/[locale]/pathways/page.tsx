import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { groupByCountry, listPublishedPathways } from "@/lib/queries/pathways";
import { PathwayCard } from "@/components/pathway/PathwayCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "커리어 패스웨이",
  description: "국가·직군별 커리어 경로와 준비 단계를 한눈에 확인하세요.",
};

export default async function PathwaysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const groups = groupByCountry(await listPublishedPathways());

  return (
    <>
      <section className="border-b border-line-soft bg-gradient-to-b from-surface to-white">
        <div className="container-page py-12 md:py-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            해외 진출 · 국내 커리어
          </p>
          <h1 className="mt-5 text-[34px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[44px]">커리어 패스웨이</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
            가고 싶은 국가와 직군을 고르면, 지금 필요한 학습과 인증을 단계별로 안내해 드려요. 목표로 설정하면 마이 러닝에서 진행 상황을
            확인할 수 있어요.
          </p>
        </div>
      </section>

      <div className="container-page py-12 md:py-16">
        {groups.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-5 w-5" />}
            title="준비 중인 커리어 패스웨이가 곧 공개됩니다"
            description="국가·직군별 경로를 담당 부서에서 검토하고 있어요. 그동안 필요한 역량을 먼저 쌓아 보세요."
            action={{ label: "전체 프로그램 보기", href: `/${locale}/courses` }}
          />
        ) : (
          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.country} aria-labelledby={`country-${g.country}`}>
                <h2 id={`country-${g.country}`} className="mb-6 text-2xl font-bold tracking-tight text-ink">
                  {g.country} <span className="text-base font-semibold text-muted">· {g.items.length}개 경로</span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((p) => (
                    <PathwayCard key={p.id} pathway={p} locale={locale} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
