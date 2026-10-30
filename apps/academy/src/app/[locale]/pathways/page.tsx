import Link from "next/link";
import { EmptyState, PageHeader, SectionHeader, buttonVariants } from "@bayada/ui";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { groupByCountry, listPublishedPathways } from "@/lib/queries/pathways";
import { PathwayCard } from "@/components/pathway/PathwayCard";

export const metadata: Metadata = {
  title: "커리어 패스웨이",
  description: "국가·직군별 커리어 경로와 준비 단계를 한눈에 확인하세요.",
};

export default async function PathwaysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const groups = groupByCountry(await listPublishedPathways());

  return (
    <>
      <div className="container-page page-y">
        <PageHeader
          eyebrow="해외 진출 · 국내 커리어"
          title="커리어 패스웨이"
          description="가고 싶은 국가와 직군을 고르면, 지금 필요한 학습과 인증을 단계별로 안내해 드려요. 목표로 설정하면 마이 러닝에서 진행 상황을 확인할 수 있어요."
        />

        {groups.length === 0 ? (
          <EmptyState
            framed
            icon={<Compass />}
            title="준비 중인 커리어 패스웨이가 곧 공개됩니다"
            description="국가·직군별 경로를 담당 부서에서 검토하고 있어요. 그동안 필요한 역량을 먼저 쌓아 보세요."
            action={
<Link href={`/${locale}/courses`} className={buttonVariants({ variant: "secondary" })}>
전체 프로그램 보기
</Link>
}
          />
        ) : (
          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.country} aria-labelledby={`country-${g.country}`}>
                <SectionHeader
                  id={`country-${g.country}`}
                  title={
                    <>
                      {g.country} <span className="text-body font-semibold text-muted">· {g.items.length}개 경로</span>
                    </>
                  }
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
