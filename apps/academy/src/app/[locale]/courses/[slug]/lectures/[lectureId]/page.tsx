import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronDown, FileText, HelpCircle, ListOrdered, PlayCircle } from "lucide-react";
import { prisma } from "@bayada/db";
import type { LectureType } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { getCourseForDetail, resolveCourseAccess } from "@/lib/queries/courses";
import { LECTURE_TYPE_LABEL, formatSeconds } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { htmlToText } from "@/lib/html-text";
import { LectureBody } from "@/components/lecture/LectureBody";
import { QuizRunner, type ClientQuestion } from "@/components/lecture/QuizRunner";

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
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(selfPath)}`);
  if (access.kind === "login") notFound();
  const enrolled = !!access.enrollment;
  // 수강 신청 전에는 미리보기(isFree) 레슨만
  if (!enrolled && !current.isFree) redirect(detailPath);

  const [lecture, doneRows, passedAttempt] = await Promise.all([
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
      where: { userId: viewer.id, completed: true, lectureId: { in: all.map((l) => l.id) } },
      select: { lectureId: true },
    }),
    current.type === "QUIZ"
      ? prisma.quizAttempt.findFirst({
          where: { userId: viewer.id, passed: true, quiz: { lectureId } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  if (!lecture) notFound();

  const done = new Set(doneRows.map((r) => r.lectureId));
  const computed = all.length ? Math.round((all.filter((l) => done.has(l.id)).length / all.length) * 100) : 0;
  // 수강 진도율은 Enrollment 기준(마이 러닝·상세와 동일). 옮겨 온 데이터는 레슨 기록보다 높을 수 있다
  const progress = access.enrollment
    ? access.enrollment.completedAt
      ? 100
      : Math.max(access.enrollment.progressPercent, computed)
    : computed;
  const prev = index > 0 ? { id: all[index - 1].id, title: all[index - 1].title } : null;
  const next = index < all.length - 1 ? { id: all[index + 1].id, title: all[index + 1].title } : null;
  const basePath = `${detailPath}/lectures`;
  const certificatesHref = `/${locale}/dashboard/certificates`;

  const curriculum = (
    <ol className="space-y-5">
      {course.sections.map((s, si) => (
        <li key={s.id}>
          <p className="mb-1.5 px-3 text-xs font-semibold text-muted">
            {si + 1}. {s.title}
          </p>
          <ul>
            {s.lectures.map((l) => {
              const Icon = ICON[l.type];
              const isCurrent = l.id === lectureId;
              const isDone = done.has(l.id);
              const canOpen = enrolled || l.isFree;
              const inner = (
                <>
                  {isDone ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="완료" />
                  ) : (
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isCurrent ? "text-brand" : "text-subtle"}`} aria-hidden />
                  )}
                  <span className="flex-1 leading-snug">{l.title}</span>
                  {l.duration ? <span className="shrink-0 text-[11px] text-subtle">{formatSeconds(l.duration)}</span> : null}
                </>
              );
              const cls = `flex items-start gap-2.5 rounded-lg px-3 py-2 text-[13px] ${
                isCurrent ? "bg-white font-semibold text-ink shadow-card ring-1 ring-line" : "text-ink-soft"
              }`;
              return (
                <li key={l.id}>
                  {canOpen && !isCurrent ? (
                    <Link href={`${basePath}/${l.id}`} className={`${cls} hover:bg-white hover:text-ink`}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={`${cls} ${canOpen ? "" : "opacity-50"}`} aria-current={isCurrent ? "page" : undefined}>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="bg-surface">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-5 lg:px-8">
          <Link
            href={detailPath}
            className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{course.title}</span>
          </Link>
          {enrolled && (
            <div className="ml-auto hidden shrink-0 items-center gap-3 sm:flex">
              <span className="text-xs text-muted">진도율</span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line-soft">
                <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
              </div>
              <span className="w-9 text-right text-xs font-bold text-ink">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[320px_1fr]">
        <aside className="hidden border-r border-line lg:block">
          <div className="sticky top-[100px] max-h-[calc(100vh-100px)] overflow-y-auto px-4 py-6">
            <p className="mb-4 flex items-center gap-2 px-3 text-sm font-bold text-ink">
              <ListOrdered className="h-4 w-4" aria-hidden /> 커리큘럼
            </p>
            {curriculum}
          </div>
        </aside>

        <div className="min-w-0 px-5 py-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-[920px]">
            <p className="text-xs font-semibold text-muted">
              {current.sectionTitle} · {LECTURE_TYPE_LABEL[current.type]}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-[28px]">{current.title}</h1>

            <div className="mt-6">
              {current.type === "QUIZ" ? (
                lecture.quiz && lecture.quiz.questions.length > 0 ? (
                  <QuizRunner
                    lectureId={lectureId}
                    questions={lecture.quiz.questions.map(toClientQuestion)}
                    passingScore={lecture.quiz.passingScore}
                    enrolled={enrolled}
                    alreadyPassed={!!passedAttempt || done.has(lectureId)}
                    nextHref={next ? `${basePath}/${next.id}` : null}
                    certificatesHref={certificatesHref}
                  />
                ) : (
                  <p className="rounded-2xl border border-line bg-white p-6 text-sm text-muted">
                    이 퀴즈에는 문항이 없어요.
                  </p>
                )
              ) : (
                <LectureBody
                  key={lectureId}
                  type={current.type}
                  lectureId={lectureId}
                  title={current.title}
                  videoUrl={lecture.videoUrl}
                  contentHtml={lecture.content}
                  enrolled={enrolled}
                  initialCompleted={done.has(lectureId)}
                  basePath={basePath}
                  prev={prev}
                  next={next}
                  certificatesHref={certificatesHref}
                />
              )}
            </div>

            {/* 모바일 커리큘럼 */}
            <details className="mt-8 rounded-2xl border border-line bg-white lg:hidden">
              <summary className="flex items-center justify-between px-5 py-4 text-sm font-bold text-ink">
                <span className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" aria-hidden /> 커리큘럼 · {all.length}개 강의
                </span>
                <ChevronDown className="accordion-chevron h-4 w-4 transition-transform" aria-hidden />
              </summary>
              <div className="border-t border-line-soft bg-surface px-2 py-4">{curriculum}</div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
