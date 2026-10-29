import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Award, BookOpen, CalendarCheck, Check, Flag, Globe2, Lock } from "lucide-react";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import {
  DEFAULT_PATHWAY_DISCLAIMER,
  credentialHref,
  getPublishedPathway,
  pathwayProgress,
  type PathwayStepView,
} from "@/lib/queries/pathways";
import { JOB_ROLE_LABEL, formatDate } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { GoalButton } from "@/components/pathway/GoalButton";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.pathway.findFirst({
    where: { slug: decodeParam(slug), published: true },
    select: { title: true, summary: true, coverImage: true },
  });
  if (!p) return { title: "커리어 패스웨이" };
  return {
    title: p.title,
    description: p.summary ?? undefined,
    openGraph: p.coverImage ? { images: [p.coverImage] } : undefined,
  };
}

function StepStatusBadge({ step, signedIn }: { step: PathwayStepView; signedIn: boolean }) {
  const s = step.status;
  if (s.kind === "milestone") {
    return <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">안내 단계</span>;
  }
  if (s.kind === "credential" && !step.credential?.active) {
    return <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">인증 준비 중</span>;
  }
  if (!signedIn) return null;
  if (s.kind === "course") {
    if (s.state === "completed")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
          <Check className="h-3 w-3" aria-hidden /> 수료 완료
        </span>
      );
    if (s.state === "in_progress")
      return (
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
          {s.progress > 0 ? `학습 중 ${s.progress}%` : "수강 신청함"}
        </span>
      );
    return <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-soft">시작 전</span>;
  }
  return s.state === "held" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
      <Check className="h-3 w-3" aria-hidden /> 인증 보유
    </span>
  ) : (
    <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-soft">미보유</span>
  );
}

function StepLink({ step, locale }: { step: PathwayStepView; locale: string }) {
  if (step.course) {
    const st = step.status.kind === "course" ? step.status.state : "not_started";
    return (
      <Link
        href={`/${locale}/courses/${encodeURIComponent(step.course.slug)}`}
        className="group mt-4 flex items-center gap-3 rounded-xl border border-line bg-white p-3 pr-4 transition-colors hover:border-ink"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-soft ring-1 ring-line">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-muted">연결 프로그램</span>
          <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand">{step.course.title}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-ink-soft">
          {st === "completed"
            ? "다시 보기"
            : st === "in_progress" && step.status.kind === "course" && step.status.progress > 0
              ? "이어 학습"
              : "보러 가기"}{" "}
          →
        </span>
      </Link>
    );
  }
  if (step.courseLocked) {
    return (
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs text-muted ring-1 ring-line">
        <Lock className="h-3.5 w-3.5" aria-hidden /> 연결된 프로그램은 현재 열람 권한이 있는 회원에게만 공개돼요.
      </p>
    );
  }
  if (step.credential) {
    return step.credential.active ? (
      <Link
        href={credentialHref(locale, step.credential.slug)}
        className="group mt-4 flex items-center gap-3 rounded-xl border border-line bg-white p-3 pr-4 transition-colors hover:border-ink"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Award className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-muted">바야다 인증</span>
          <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand">{step.credential.title}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-ink-soft">인증 알아보기 →</span>
      </Link>
    ) : (
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs text-muted ring-1 ring-line">
        <Award className="h-3.5 w-3.5" aria-hidden /> {step.credential.title} — 인증 과정이 열리면 이곳에서 안내해 드려요.
      </p>
    );
  }
  return null;
}

export default async function PathwayDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const viewer = await getViewer();
  const p = await getPublishedPathway(decodeParam(slug), viewer);
  if (!p) notFound();
  const base = `/${locale}`;
  const signedIn = !!viewer;
  const { passed, current } = pathwayProgress(p.steps);
  const disclaimer = p.disclaimer?.trim() || DEFAULT_PATHWAY_DISCLAIMER;
  const content = p.content?.trim() ? sanitizeHtml(p.content) : "";

  return (
    <div className="pb-20">
      {/* 히어로 */}
      <section className="border-b border-line-soft bg-gradient-to-b from-surface to-white">
        <div className="container-page py-10 md:py-14">
          <nav aria-label="현재 위치" className="text-xs text-muted">
            <Link href={base} className="hover:text-ink">
              홈
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={`${base}/pathways`} className="hover:text-ink">
              커리어 패스웨이
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink-soft">{p.country}</span>
          </nav>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-line-soft">
              {p.coverImage ? (
                // 표지 이미지는 어드민이 입력한 원격 URL
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-zinc-100 via-zinc-50 to-white p-8">
                  <Globe2 className="h-8 w-8 text-brand" aria-hidden />
                  <span className="text-[44px] font-bold tracking-tight text-ink">{p.country}</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                  <Globe2 className="h-3.5 w-3.5" aria-hidden /> {p.country}
                </span>
                {p.jobRole && (
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft">
                    {JOB_ROLE_LABEL[p.jobRole]}
                  </span>
                )}
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft">
                  {p.steps.length}단계
                </span>
              </div>
              <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[42px]">{p.title}</h1>
              {p.summary && <p className="mt-4 text-[17px] leading-relaxed text-muted">{p.summary}</p>}
              <div className="mt-8">
                <GoalButton pathwayId={p.id} locale={locale} isGoal={p.isGoal} />
              </div>
            </div>
          </div>

          {p.steps.length > 0 && (
            <ol className="no-scrollbar -mx-5 mt-10 flex snap-x gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:overflow-visible md:px-0">
              {p.steps.map((s, i) => (
                <li
                  key={s.id}
                  className={`w-[62%] shrink-0 snap-start rounded-2xl border bg-white p-4 sm:w-[40%] md:w-auto ${
                    signedIn && i === current ? "border-brand ring-1 ring-brand" : "border-line"
                  }`}
                >
                  <a href={`#step-${i + 1}`} className="block">
                    <span className="flex items-center justify-between text-[11px] font-bold tracking-wide text-brand">
                      STEP {i + 1}
                      {signedIn && passed[i] && <Check className="h-3.5 w-3.5 text-success" aria-label="완료" />}
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-[15px] font-bold leading-snug text-ink">{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <div className="container-page">
        <div className="mx-auto max-w-[860px]">
          {/* 정보 기준일 · 면책 고지 */}
          <section aria-labelledby="notice-title" className="mt-12 rounded-2xl border border-amber-300 bg-amber-50 p-5 md:p-6">
            <h2 id="notice-title" className="flex items-center gap-2 text-[15px] font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4" aria-hidden /> 꼭 확인해 주세요
            </h2>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900">
              <CalendarCheck className="h-4 w-4" aria-hidden />
              정보 기준일{" "}
              {p.infoAsOf ? (
                <time dateTime={p.infoAsOf.toISOString().slice(0, 10)}>{formatDate(p.infoAsOf)}</time>
              ) : (
                <span>미기재</span>
              )}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-amber-900/90">{disclaimer}</p>
          </section>

          {content && (
            <section className="mt-14">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">자격 경로 개요</h2>
              <div className="legacy-content mt-5" dangerouslySetInnerHTML={{ __html: content }} />
            </section>
          )}

          {/* 단계 타임라인 */}
          <section id="steps" className="mt-16 scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                단계별 준비 <span className="text-muted">· {p.steps.length}단계</span>
              </h2>
              {!signedIn && (
                <Link
                  href={`${base}/auth/login?callbackUrl=${encodeURIComponent(`${base}/pathways/${p.slug}`)}`}
                  className="text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  로그인하면 내 진행 상황이 보여요 →
                </Link>
              )}
            </div>
            {p.steps.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
                단계 안내를 준비하고 있어요.
              </p>
            ) : (
              <ol className="mt-8">
                {p.steps.map((s, i) => {
                  const last = i === p.steps.length - 1;
                  const isPassed = signedIn && passed[i];
                  const isCurrent = signedIn && i === current;
                  return (
                    <li key={s.id} id={`step-${i + 1}`} className="relative flex scroll-mt-28 gap-5 pb-8 last:pb-0">
                      {!last && (
                        <span
                          className={`absolute left-[19px] top-11 bottom-1 w-0.5 rounded-full ${isPassed ? "bg-success" : "bg-line"}`}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isPassed
                            ? "bg-success text-white"
                            : isCurrent
                              ? "bg-brand text-white ring-4 ring-brand-soft"
                              : "bg-white text-ink-soft ring-1 ring-line"
                        }`}
                      >
                        {isPassed ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                      </span>
                      <div
                        className={`min-w-0 flex-1 rounded-2xl border p-5 ${isCurrent ? "border-brand/40 bg-brand-soft/40" : "border-line bg-white"}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold tracking-wide text-brand">STEP {i + 1}</span>
                          <StepStatusBadge step={s} signedIn={signedIn} />
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                              <Flag className="h-3 w-3" aria-hidden /> 지금 단계
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-[17px] font-bold text-ink">{s.title}</h3>
                        {s.description && (
                          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{s.description}</p>
                        )}
                        <StepLink step={s} locale={locale} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-6 py-5 text-sm">
            <span className="text-muted">다른 국가·직군의 경로도 살펴보세요</span>
            <Link href={`${base}/pathways`} className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brand">
              커리어 패스웨이 전체 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
