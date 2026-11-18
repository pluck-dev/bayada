"use client";

import { Button, buttonVariants, cn, useFeedback } from "@bayada/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight, Award, Check, ChevronLeft, FileText, HelpCircle, PartyPopper, PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

interface NavLecture {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ";
}

const NEXT_ICON = { VIDEO: PlayCircle, TEXT: FileText, QUIZ: HelpCircle };
const NEXT_LABEL = { VIDEO: "영상", TEXT: "읽기", QUIZ: "퀴즈" };

/** 영상·읽기 레슨 본문 + 완료 처리 + 이전/다음 + 수료 축하 */
export function LectureBody({
  type,
  lectureId,
  title,
  heading,
  videoUrl,
  contentHtml,
  enrolled,
  initialCompleted,
  startAt,
  watchedUntil,
  basePath,
  prev,
  next,
  courseAlreadyDone,
  certificateHref,
}: {
  type: "VIDEO" | "TEXT";
  lectureId: string;
  title: string;
  heading: React.ReactNode;
  videoUrl: string | null;
  contentHtml: string | null;
  enrolled: boolean;
  initialCompleted: boolean;
  startAt: number;
  /** 서버에 기록된 본 가장 먼 지점(초) — 앞으로 건너뛰기 한계 */
  watchedUntil: number;
  basePath: string;
  prev: NavLecture | null;
  next: NavLecture | null;
  courseAlreadyDone: boolean;
  certificateHref: string;
}) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [justFinishedCourse, setJustFinishedCourse] = useState(false);

  // 영상은 본 지점·길이를 같이 보내고 서버가 95% 이상 봤는지 확인한다. 읽기는 그대로 완료
  const complete = useCallback(async (watchedSec?: number, duration?: number) => {
    if (!enrolled || completed || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "VIDEO" ? { completed: true, watchedSec, duration } : { completed: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { courseCompleted?: boolean; error?: string };
      if (!res.ok) {
        toast("error", data.error ?? "진도를 저장하지 못했어요.");
        return;
      }
      setCompleted(true);
      if (data.courseCompleted && !courseAlreadyDone) setJustFinishedCourse(true);
      else toast("success", "학습 완료로 기록했어요.");
      router.refresh();
    } catch {
      toast("error", "네트워크 오류로 진도를 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }, [enrolled, completed, saving, lectureId, router, toast, courseAlreadyDone, type]);

  const reportTime = useCallback(
    (sec: number, duration: number) => {
      if (!enrolled) return;
      // 95% 까지 봤으면 끝까지 기다리지 않고 완료 처리
      if (!completed && duration > 0 && sec >= Math.ceil(duration * 0.95)) {
        void complete(sec, duration);
        return;
      }
      fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedSec: sec }),
      }).catch(() => undefined);
    },
    [enrolled, completed, complete, lectureId]
  );

  const NextIcon = next ? NEXT_ICON[next.type] : null;

  return (
    <div>
      {type === "VIDEO" ? (
        <>
          <div className="overflow-hidden bg-black sm:rounded-[22px]">
            <VideoPlayer
              videoUrl={videoUrl}
              title={title}
              startAt={startAt}
              lockForward={enrolled && !completed}
              watchedUntil={watchedUntil}
              onTimeUpdate={reportTime}
              onComplete={(duration) => void complete(Math.floor(duration), duration)}
              onReload={() => router.refresh()}
            />
          </div>
          <div className="mt-6 px-5 sm:px-0">{heading}</div>
        </>
      ) : (
        <div className="px-5 pt-6 sm:px-0 sm:pt-0">
          {heading}
          <article className="mt-6 rounded-[22px] border border-line-soft bg-canvas p-6 md:p-10">
            {contentHtml ? (
              // 옮겨 온 WordPress 레슨 본문(관리자 작성, 신뢰 콘텐츠)
              <div className="legacy-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <p className="text-body-sm text-muted">이 레슨에는 본문이 없어요.</p>
            )}
          </article>
        </div>
      )}

      <div className="px-5 sm:px-0">
        {justFinishedCourse && (
          <div role="status" className="animate-fade-up mt-6 overflow-hidden rounded-[22px] bg-ink p-6 text-white md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand">
                  <PartyPopper className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-title font-extrabold">축하해요! 프로그램을 수료했어요</p>
                  <p className="mt-1 text-body-sm text-white/70">수료증이 발급되었어요. 인쇄하거나 PDF로 저장할 수 있어요.</p>
                </div>
              </div>
              <Link href={certificateHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "shrink-0")}>
                <Award aria-hidden /> 수료증 보기
              </Link>
            </div>
          </div>
        )}

        {/* 완료 상태 */}
        <div
          className={cn(
            "mt-6 flex flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center sm:justify-between md:p-5",
            completed ? "bg-success-soft" : "bg-surface-sunken",
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                completed ? "bg-success text-white" : "bg-canvas text-subtle",
              )}
            >
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <div>
              <p className={cn("text-body-sm font-bold", completed ? "text-success" : "text-ink")}>
                {!enrolled ? "미리보기 중이에요" : completed ? "학습 완료" : "아직 완료하지 않았어요"}
              </p>
              <p className="text-caption text-muted">
                {!enrolled
                  ? "수강 신청하면 진도가 저장되고 수료증을 받을 수 있어요."
                  : completed
                    ? "이 강의는 진도에 반영됐어요."
                    : type === "VIDEO"
                      ? "영상을 끝까지 보면 자동으로 완료돼요. 아직 안 본 구간으로는 건너뛸 수 없어요."
                      : "다 읽었으면 완료를 눌러 주세요. 다음 강의로 넘어가도 완료돼요."}
              </p>
            </div>
          </div>
          {enrolled && !completed && type === "TEXT" && (
            <Button onClick={() => void complete()} loading={saving} variant="outline" className="shrink-0">
              <Check aria-hidden /> 다 읽었어요
            </Button>
          )}
        </div>

        {/* 이전 / 다음 */}
        <div className="mt-4 flex items-stretch gap-3">
          {prev && (
            <Link
              href={`${basePath}/${prev.id}`}
              aria-label={`이전 강의: ${prev.title}`}
              className="flex shrink-0 items-center gap-1 rounded-[22px] border border-line px-4 text-body-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-surface md:px-5"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden /> 이전
            </Link>
          )}
          {next && NextIcon ? (
            <Link
              href={`${basePath}/${next.id}`}
              onClick={() => {
                // 읽기 레슨은 다음으로 넘어가면 완료로 본다
                if (type === "TEXT") void complete();
              }}
              className="group flex min-w-0 flex-1 items-center gap-4 rounded-[22px] bg-brand px-5 py-4 text-white transition-colors hover:bg-brand-hover"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <NextIcon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-caption font-semibold text-white/75">다음 강의 · {NEXT_LABEL[next.type]}</span>
                <span className="block truncate text-body font-bold">{next.title}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-[22px] bg-surface-sunken px-5 py-4">
              <span className="min-w-0">
                <span className="block text-caption font-semibold text-muted">마지막 강의예요</span>
                <span className="block text-body-sm font-bold text-ink">
                  {courseAlreadyDone || justFinishedCourse ? "수료증을 확인해 보세요" : "모든 강의를 완료하면 수료증이 발급돼요"}
                </span>
              </span>
              {(courseAlreadyDone || justFinishedCourse) && (
                <Link href={certificateHref} className={buttonVariants({ variant: "primary", size: "sm" })}>
                  <Award aria-hidden /> 수료증
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
