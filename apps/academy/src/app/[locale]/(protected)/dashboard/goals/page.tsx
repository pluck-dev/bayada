import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, Compass, PartyPopper } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { credentialHref, getMyPathwayGoals, type PathwayStepView } from "@/lib/queries/pathways";
import { JOB_ROLE_LABEL } from "@/lib/labels";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "커리어 목표" };

/** 다음 단계 CTA — 연결된 프로그램·인증이 있으면 그리로, 없으면 패스웨이 상세의 해당 단계로 */
function nextAction(step: PathwayStepView, index: number, locale: string, pathwaySlug: string) {
  if (step.course) {
    const resume = step.status.kind === "course" && step.status.state === "in_progress" && step.status.progress > 0;
    return {
      label: resume ? "이어 학습하기" : "학습 시작하기",
      href: `/${locale}/courses/${encodeURIComponent(step.course.slug)}`,
    };
  }
  if (step.credential?.active) return { label: "인증 알아보기", href: credentialHref(locale, step.credential.slug) };
  return { label: "단계 안내 보기", href: `/${locale}/pathways/${encodeURIComponent(pathwaySlug)}#step-${index + 1}` };
}

export default async function GoalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = (await getViewer())!;
  const goals = await getMyPathwayGoals(viewer);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">커리어 목표</h1>
      <p className="mt-2 text-[15px] text-muted">목표로 설정한 커리어 패스웨이의 현재 위치와 다음 단계를 보여 드려요.</p>

      {goals.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Compass className="h-5 w-5" />}
            title="아직 설정한 커리어 목표가 없어요"
            description="커리어 패스웨이에서 원하는 경로를 ‘목표로 설정’하면 이곳에서 진행 상황을 확인할 수 있어요."
            action={{ label: "커리어 패스웨이 보기", href: `/${locale}/pathways` }}
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {goals.map((g) => {
            const { passed, current, doneCount } = g.progress;
            const next = current >= 0 ? g.steps[current] : null;
            const cta = next ? nextAction(next, current, locale, g.slug) : null;
            const detail = `/${locale}/pathways/${encodeURIComponent(g.slug)}`;
            return (
              <li key={g.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted">
                      {[g.country, g.jobRole ? JOB_ROLE_LABEL[g.jobRole] : null].filter(Boolean).join(" · ")}
                    </p>
                    <Link href={detail} className="mt-1 block text-[17px] font-bold text-ink hover:text-brand">
                      {g.title}
                    </Link>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-line">
                    {doneCount}/{g.steps.length} 단계
                  </span>
                </div>

                {g.steps.length > 0 && (
                  <div className="no-scrollbar -mx-5 mt-6 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
                    <ol className="flex min-w-max sm:min-w-0">
                      {g.steps.map((s, i) => {
                        const isPassed = passed[i];
                        const isCurrent = i === current;
                        return (
                          <li key={s.id} className="relative flex w-28 shrink-0 flex-col items-center text-center sm:w-auto sm:flex-1">
                            {i > 0 && (
                              <span
                                className={`absolute right-1/2 top-5 h-[3px] w-full -translate-y-1/2 ${passed[i - 1] ? "bg-ink" : "bg-line"}`}
                                aria-hidden
                              />
                            )}
                            <span
                              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                isPassed
                                  ? "bg-ink text-white"
                                  : isCurrent
                                    ? "bg-white text-brand ring-2 ring-brand"
                                    : "bg-white text-subtle ring-2 ring-line"
                              }`}
                            >
                              {isPassed ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                            </span>
                            <span
                              className={`mt-2.5 line-clamp-2 px-1 text-[13px] font-semibold leading-snug ${
                                isCurrent ? "text-brand" : isPassed ? "text-ink" : "text-muted"
                              }`}
                            >
                              {s.title}
                            </span>
                            {isCurrent && <span className="mt-1 text-[11px] font-semibold text-brand">현재 위치</span>}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-line-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {next && cta ? (
                    <>
                      <p className="text-sm text-ink-soft">
                        <span className="font-semibold text-ink">다음 단계</span> · STEP {current + 1} {next.title}
                        {next.status.kind === "course" && next.status.state === "in_progress" && next.status.progress > 0 && (
                          <span className="text-brand"> ({next.status.progress}% 학습 중)</span>
                        )}
                      </p>
                      <Link
                        href={cta.href}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
                      >
                        {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </>
                  ) : g.steps.length === 0 ? (
                    <p className="text-sm text-muted">단계 안내를 준비하고 있어요.</p>
                  ) : (
                    <>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                        <PartyPopper className="h-4 w-4" aria-hidden /> 모든 단계를 마쳤어요
                      </p>
                      <Link href={detail} className="text-sm font-semibold text-ink-soft hover:text-ink">
                        패스웨이 다시 보기 →
                      </Link>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
