import { EmptyState, ProgressBar, buttonVariants, cn } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Award, Check, FileText, HelpCircle, ListOrdered, Lock, PlayCircle } from "lucide-react";
import { prisma } from "@bayada/db";
import type { LectureType } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { getCourseForDetail, resolveCourseAccess } from "@/lib/queries/courses";
import { LECTURE_TYPE_LABEL, formatSeconds } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { htmlToText } from "@/lib/html-text";
import { LectureBody } from "@/components/lecture/LectureBody";
import { QuizRunner, type ClientQuestion } from "@/components/lecture/QuizRunner";
import { CurriculumSheet } from "@/components/lecture/CurriculumSheet";

type Params = Promise<{ locale: string; slug: string; lectureId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lectureId } = await params;
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { title: true, section: { select: { course: { select: { title: true } } } } },
  });
  return {
    title: lecture ? `${lecture.title} · ${lecture.section.course.title}` : undefined,
    robots: { index: false, follow: false },
  };
}

const ICON: Record<LectureType, typeof PlayCircle> = { VIDEO: PlayCircle, TEXT: FileText, QUIZ: HelpCircle };

/** 정답을 빼고 클라이언트에 내려줄 문항 */
function toClientQuestion(q: { id: string; type: string; text: string; options: unknown }): ClientQuestion {
  const options = (Array.isArray(q.options) ? q.options : []) as { text?: string }[];
  switch (q.type) {
    case "FILL_GAP":
      return {
        id: q.id,
        type: "FILL_GAP",
        text: htmlToText(q.text),
        segments: htmlToText(options[0]?.text ?? "").split(/\|[^|]+\|/),
      };
    case "KEYWORDS":
      return { id: q.id, type: "KEYWORDS", text: htmlToText(q.text) };
    case "MULTI":
    case "TRUE_FALSE":
    case "SINGLE":
    default:
      return {
        id: q.id,
        type: q.type === "MULTI" ? "MULTI" : q.type === "TRUE_FALSE" ? "TRUE_FALSE" : "SINGLE",
        text: htmlToText(q.text),
        options: options.map((o) => htmlToText(o.text ?? "")),
      };
  }
}

export default async function LecturePage({ params }: { params: Params }) {
  const { locale, slug: rawSlug, lectureId } = await params;
  const slug = decodeParam(rawSlug);
  const detailPath = `/${locale}/courses/${encodeURIComponent(slug)}`;
  const selfPath = `${detailPath}/lectures/${lectureId}`;

  const viewer = await getViewer();
  const course = await getCourseForDetail(slug);
  if (!course) notFound();
  const all = course.sections.flatMap((s) => s.lectures.map((l) => ({ ...l, sectionTitle: s.title })));
  const index = all.findIndex((l) => l.id === lectureId);
  if (index < 0) notFound();
  const current = all[index];

  const access = await resolveCourseAccess(course, viewer);
  if (access.kind === "notfound") notFound();
  // 강의를 보려는 순간 로그인 — 목록·상세는 비로그인도 본다
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(selfPath)}`);
  // 사내 전용인데 임직원이 아니면 상세의 안내로 돌려보낸다
  if (access.kind !== "ok") redirect(detailPath);
  const enrolled = !!access.enrollment;
  // 수강 신청 전에는 미리보기(isFree) 레슨만
  if (!enrolled && !current.isFree) redirect(detailPath);

  const [lecture, progressRows, passedAttempt, certificate] = await Promise.all([
    prisma.lecture.findUnique({
      where: { id: lectureId },
      select: {
        videoUrl: true,
        content: true,
        quiz: {
          select: {
            id: true,
            passingScore: true,
            questions: { orderBy: { order: "asc" }, select: { id: true, type: true, text: true, options: true } },
          },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId: viewer.id, lectureId: { in: all.map((l) => l.id) } },
      select: { lectureId: true, completed: true, watchedSec: true },
    }),
    current.type === "QUIZ"
      ? prisma.quizAttempt.findFirst({
          where: { userId: viewer.id, passed: true, quiz: { lectureId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    enrolled
      ? prisma.certificate.findUnique({
          where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
          select: { number: true },
        })
      : Promise.resolve(null),
  ]);
  if (!lecture) notFound();

  const done = new Set(progressRows.filter((r) => r.completed).map((r) => r.lectureId));
  const startAt = progressRows.find((r) => r.lectureId === lectureId)?.watchedSec ?? 0;
  const doneCount = all.filter((l) => done.has(l.id)).length;
  const computed = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  // 수강 진도율은 Enrollment 기준(마이 러닝·상세와 동일). 옮겨 온 데이터는 레슨 기록보다 높을 수 있다
  const courseDone = !!access.enrollment?.completedAt;
  const progress = access.enrollment ? (courseDone ? 100 : Math.max(access.enrollment.progressPercent, computed)) : computed;
  const prev = index > 0 ? { id: all[index - 1].id, title: all[index - 1].title, type: all[index - 1].type } : null;
  const next = index < all.length - 1 ? { id: all[index + 1].id, title: all[index + 1].title, type: all[index + 1].type } : null;
  const basePath = `${detailPath}/lectures`;
  const certificateHref = certificate
    ? `/${locale}/certificates/${encodeURIComponent(certificate.number)}/print`
    : `/${locale}/dashboard/certificates`;

  const curriculum = (
    <ol className="space-y-6">
      {course.sections.map((s, si) => {
        const sDone = s.lectures.filter((l) => done.has(l.id)).length;
        return (
          <li key={s.id}>
            <p className="mb-2 flex items-baseline justify-between gap-3 px-2 text-caption font-bold text-muted">
              <span>
                <span className="tabular mr-1.5 text-ink">{String(si + 1).padStart(2, "0")}</span>
                {s.title}
              </span>
              <span className="tabular shrink-0 font-semibold text-subtle">
                {sDone}/{s.lectures.length}
              </span>
            </p>
            <ul className="space-y-0.5">
              {s.lectures.map((l) => {
                const Icon = ICON[l.type];
                const isCurrent = l.id === lectureId;
                const isDone = done.has(l.id);
                const canOpen = enrolled || l.isFree;
                const inner = (
                  <>
                    <span
                      className={cn(
                        "mt-px flex size-6 shrink-0 items-center justify-center rounded-full",
                        isDone ? "bg-success text-white" : isCurrent ? "bg-brand text-white" : "bg-surface-sunken text-muted",
                      )}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-label="완료" />
                      ) : canOpen ? (
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Lock className="h-3 w-3" aria-label="잠김" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug">{l.title}</span>
                      <span className="mt-0.5 block text-micro font-medium text-subtle">
                        {LECTURE_TYPE_LABEL[l.type]}
                        {l.type === "QUIZ"
                          ? ` · ${l.quiz?._count.questions ?? 0}문항`
                          : l.duration
                            ? ` · ${formatSeconds(l.duration)}`
                            : ""}
                        {isCurrent && " · 지금 학습 중"}
                      </span>
                    </span>
                  </>
                );
                const cls = cn(
                  "flex items-start gap-3 rounded-2xl px-2 py-2.5 text-body-sm transition-colors",
                  isCurrent ? "bg-brand-50 font-semibold text-ink" : "text-ink-soft",
                );
                return (
                  <li key={l.id}>
                    {canOpen && !isCurrent ? (
                      <Link href={`${basePath}/${l.id}`} className={`${cls} hover:bg-surface-sunken hover:text-ink`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={`${cls} ${canOpen ? "" : "opacity-55"}`} aria-current={isCurrent ? "step" : undefined}>
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );

  const progressBlock = enrolled ? (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-caption font-semibold text-muted">{courseDone ? "수료 완료" : "내 진도"}</span>
        <span className="tabular text-body-sm font-extrabold text-ink">{progress}%</span>
      </div>
      <ProgressBar value={progress} size="sm" className="mt-1.5" tone={courseDone ? "success" : "brand"} />
      <p className="mt-1.5 text-micro text-subtle">
        {doneCount}/{all.length}개 강의 완료
      </p>
    </div>
  ) : (
    <p className="rounded-xl bg-warning-soft px-3 py-2 text-caption font-medium text-warning">미리보기 중 · 수강 신청하면 진도가 저장돼요</p>
  );

  return (
    <div className="bg-canvas">
      {/* 강의실 상단 바 — 사이트 헤더 바로 아래 고정 */}
      <div className="sticky top-16 z-sticky border-b border-line-soft bg-canvas/95 backdrop-blur lg:top-[72px]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-5 lg:px-8">
          <Link
            href={detailPath}
            aria-label={`${course.title} 프로그램으로 돌아가기`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink transition-colors hover:bg-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-bold text-ink">{course.title}</p>
            <p className="truncate text-micro font-medium text-muted">
              {index + 1}/{all.length} · {current.sectionTitle}
            </p>
          </div>
          {enrolled && (
            <div className="hidden shrink-0 items-center gap-2.5 md:flex">
              <ProgressBar value={progress} size="sm" className="w-28" tone={courseDone ? "success" : "brand"} />
              <span className="tabular w-10 text-right text-caption font-bold text-ink">{progress}%</span>
            </div>
          )}
          {courseDone && (
            <Link href={certificateHref} className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}>
              <Award aria-hidden /> 수료증
            </Link>
          )}
          <CurriculumSheet count={all.length} done={doneCount}>
            <div className="mb-5">{progressBlock}</div>
            {curriculum}
          </CurriculumSheet>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 px-0 pb-16 pt-0 sm:px-5 sm:pt-6 lg:px-10 lg:pt-8">
          <div className="mx-auto max-w-[960px]">
            {current.type === "QUIZ" ? (
              <div className="px-5 pt-6 sm:px-0 sm:pt-0">
                <LectureHeading section={current.sectionTitle} type={current.type} title={current.title} meta={`${lecture.quiz?.questions.length ?? 0}문항`} />
                <div className="mt-6">
                  {lecture.quiz && lecture.quiz.questions.length > 0 ? (
                    <QuizRunner
                      lectureId={lectureId}
                      questions={lecture.quiz.questions.map(toClientQuestion)}
                      passingScore={lecture.quiz.passingScore}
                      enrolled={enrolled}
                      alreadyPassed={!!passedAttempt || done.has(lectureId)}
                      nextHref={next ? `${basePath}/${next.id}` : null}
                      nextTitle={next?.title ?? null}
                      certificateHref={certificateHref}
                    />
                  ) : (
                    <EmptyState framed icon={<HelpCircle />} title="이 퀴즈에는 문항이 없어요" description="다음 강의로 넘어가 주세요." />
                  )}
                </div>
              </div>
            ) : (
              <LectureBody
                key={lectureId}
                type={current.type}
                lectureId={lectureId}
                title={current.title}
                heading={
                  <LectureHeading
                    section={current.sectionTitle}
                    type={current.type}
                    title={current.title}
                    meta={current.duration ? formatSeconds(current.duration) : null}
                  />
                }
                videoUrl={lecture.videoUrl}
                contentHtml={lecture.content}
                enrolled={enrolled}
                initialCompleted={done.has(lectureId)}
                startAt={done.has(lectureId) ? 0 : startAt}
                basePath={basePath}
                prev={prev}
                next={next}
                courseAlreadyDone={courseDone}
                certificateHref={certificateHref}
              />
            )}
          </div>
        </div>

        <aside className="hidden border-l border-line-soft lg:block">
          <div className="no-scrollbar sticky top-[128px] max-h-[calc(100dvh-128px)] overflow-y-auto px-5 py-7">
            <p className="mb-4 flex items-center gap-2 text-body font-extrabold tracking-tight text-ink">
              <ListOrdered className="h-4 w-4" aria-hidden /> 커리큘럼
            </p>
            <div className="mb-6 rounded-2xl border border-line-soft p-4">{progressBlock}</div>
            {curriculum}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LectureHeading({
  section,
  type,
  title,
  meta,
}: {
  section: string;
  type: LectureType;
  title: string;
  meta?: string | null;
}) {
  const Icon = ICON[type];
  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 text-caption font-semibold text-muted">
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-surface-sunken px-2.5 text-ink-soft">
          <Icon className="h-3.5 w-3.5" aria-hidden /> {LECTURE_TYPE_LABEL[type]}
        </span>
        <span className="truncate">{section}</span>
        {meta && <span className="tabular">· {meta}</span>}
      </p>
      <h1 className="mt-2.5 type-section-title text-ink">{title}</h1>
    </div>
  );
}
