"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Star } from "lucide-react";

const RATING_TEXT = ["", "아쉬워요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

/** 후기 작성·수정 (강의당 1개) */
export function ReviewForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial: { rating: number; content: string; showName: boolean; hidden: boolean } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!initial);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState(initial?.content ?? "");
  const [showName, setShowName] = useState(initial?.showName ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("별점을 골라 주세요.");
    if (content.trim().length < 10) return setError("후기를 10자 이상 적어 주세요.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/courses/${encodeURIComponent(courseId)}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, showName }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return setError(data.error ?? "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
        <p className="text-sm text-ink-soft">
          {saved ? "후기를 저장했어요. 소중한 의견 고마워요." : "내 후기를 남겼어요."}
          {initial?.hidden && <span className="ml-1 text-muted">(운영 검토로 비공개 처리된 후기예요)</span>}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:border-ink"
        >
          후기 수정
        </button>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <p className="text-[15px] font-bold text-ink">{initial ? "후기 수정" : "이 프로그램은 어떠셨나요?"}</p>
      <div className="mt-3 flex items-center gap-3">
        <div role="radiogroup" aria-label="별점" className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}점`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-0.5"
            >
              <Star
                className={`h-7 w-7 transition-colors ${n <= shown ? "fill-amber-400 text-amber-400" : "text-line"}`}
                aria-hidden
              />
            </button>
          ))}
        </div>
        {shown > 0 && <span className="text-sm font-semibold text-ink-soft">{RATING_TEXT[shown]}</span>}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">후기 내용</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="현장에서 도움이 된 점, 아쉬웠던 점을 들려주세요. (10자 이상)"
          className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-subtle focus:border-ink focus:outline-none"
        />
      </label>
      <div className="mt-1 text-right text-xs text-subtle">{content.length}/1000</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[#e31b34]"
          />
          이름 공개에 동의해요 <span className="text-xs text-muted">(동의하지 않으면 홍*동처럼 가려져요)</span>
        </label>
        <div className="flex gap-2">
          {initial && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:border-ink"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {initial ? "수정 완료" : "후기 등록"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-brand">
          {error}
        </p>
      )}
    </form>
  );
}
