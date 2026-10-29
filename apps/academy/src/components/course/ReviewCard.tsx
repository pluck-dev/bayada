import type { ReactNode } from "react";
import { Star } from "lucide-react";
import type { ReviewCardData } from "@/lib/queries/engagement";
import { JOB_ROLE_LABEL, formatDate } from "@/lib/labels";

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`5점 만점에 ${value.toFixed(1)}점`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-line text-line"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** 후기 카드: 별점 · 본문 · 가린 이름 · 직군 */
export function ReviewCard({
  review,
  footer,
  heading,
  clamp = false,
}: {
  review: ReviewCardData;
  footer?: ReactNode;
  heading?: ReactNode;
  clamp?: boolean;
}) {
  const meta = [
    review.jobRole && review.jobRole !== "OTHER" ? JOB_ROLE_LABEL[review.jobRole] : null,
    formatDate(review.createdAt),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
      {heading}
      <Stars value={review.rating} />
      <p
        className={`mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft ${clamp ? "line-clamp-4" : ""}`}
      >
        {review.content}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-ink-soft ring-1 ring-line">
          {review.author.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {review.author}
            {review.mine && <span className="ml-1.5 text-xs font-medium text-brand">내 후기</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {meta}
            {review.edited && " · 수정됨"}
          </p>
        </div>
        {footer}
      </div>
    </article>
  );
}
