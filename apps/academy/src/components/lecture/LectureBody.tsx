"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

interface NavLecture {
  id: string;
  title: string;
}

/** 영상·읽기 레슨 본문 + 완료 처리 + 이전/다음 */
export function LectureBody({
  type,
  lectureId,
  title,
  videoUrl,
  contentHtml,
  enrolled,
  initialCompleted,
  basePath,
  prev,
  next,
  certificatesHref,
}: {
  type: "VIDEO" | "TEXT";
  lectureId: string;
  title: string;
  videoUrl: string | null;
  contentHtml: string | null;
  enrolled: boolean;
  initialCompleted: boolean;
  basePath: string;
  prev: NavLecture | null;
  next: NavLecture | null;
  certificatesHref: string;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(async () => {
    if (!enrolled || completed || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { courseCompleted?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "진도를 저장하지 못했어요.");
        return;
      }
      setCompleted(true);
      setCourseCompleted(!!data.courseCompleted);
      router.refresh();
    } catch {
      setError("네트워크 오류로 진도를 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }, [enrolled, completed, saving, lectureId, router]);

  const reportTime = useCallback(
    (sec: number) => {
      if (!enrolled) return;
      fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedSec: sec }),
      }).catch(() => undefined);
    },
    [enrolled, lectureId]
  );

  return (
    <div>
      {type === "VIDEO" ? (
        <div className="overflow-hidden rounded-2xl bg-black">
          <VideoPlayer videoUrl={videoUrl} title={title} onTimeUpdate={reportTime} onComplete={complete} />
        </div>
      ) : (
        <article className="rounded-2xl border border-line bg-white p-6 md:p-10">
          {contentHtml ? (
            // 옮겨 온 WordPress 레슨 본문(관리자 작성, 신뢰 콘텐츠)
            <div className="legacy-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <p className="text-sm text-muted">이 레슨에는 본문이 없어요.</p>
          )}
        </article>
      )}

      {courseCompleted && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand/20 bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Award className="h-5 w-5 text-brand" aria-hidden /> 축하해요! 프로그램을 수료했어요. 수료증이 발급되었습니다.
          </p>
          <Link href={certificatesHref} className="shrink-0 text-sm font-semibold text-brand hover:underline">
            인증서 보기 →
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {enrolled ? (
            <button
              type="button"
              onClick={complete}
              disabled={completed || saving}
              className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${
                completed
                  ? "border border-success/30 bg-success-soft text-success"
                  : "bg-ink text-white hover:bg-ink-soft"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              )}
              {completed ? "학습 완료" : type === "VIDEO" ? "완료로 표시" : "다 읽었어요"}
            </button>
          ) : (
            <span className="text-sm text-muted">미리보기 중이에요. 수강 신청하면 진도가 저장돼요.</span>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm text-brand">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {prev && (
            <Link
              href={`${basePath}/${prev.id}`}
              className="inline-flex h-11 items-center gap-1 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:border-ink"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden /> 이전
            </Link>
          )}
          {next && (
            <Link
              href={`${basePath}/${next.id}`}
              onClick={() => {
                // 읽기 레슨은 다음으로 넘어가면 완료로 본다
                if (type === "TEXT") void complete();
              }}
              className="inline-flex h-11 items-center gap-1 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              다음 강의 <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
