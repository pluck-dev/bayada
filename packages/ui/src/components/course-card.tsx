import * as React from "react";

import { cn } from "../lib/cn";
import type { LinkLike } from "./link";

/**
 * 단 하나의 프로그램 카드. 홈·카탈로그·마이 러닝·기관 대시보드·어드민 큐레이션이 모두 이걸 쓴다.
 *
 * 카드 해부 (위→아래, 정보 우선순위 순)
 *   1. 썸네일 16:9 (+ 좌상단 상태 배지 1개, 우상단 오버레이 행동 1개)
 *   2. 유형 · 제공기관 (한 줄, caption)
 *   3. 제목 (2줄 제한, title)
 *   4. 메타 (대상 · 시간 · 난이도 — 가운데점 구분, 한 줄)
 *   5. 하단: 진도 막대 또는 평점 / 가격
 * 테두리 1개, 그림자 없음, hover 는 테두리 진하게 + 제목 밑줄.
 */
export interface CourseCardProps {
  href: string;
  title: string;
  /** 썸네일 요소 (앱이 이미지/대체 그래픽을 결정) */
  media: React.ReactNode;
  /** 유형 라벨 (예: 단과 강좌) */
  typeLabel?: string;
  provider?: string;
  meta?: Array<string | null | undefined | false>;
  rating?: { avg: number; count: number } | null;
  price?: React.ReactNode;
  /** 썸네일 좌상단 배지 (사내 전용 등) */
  badge?: React.ReactNode;
  /** 썸네일 우상단 행동 (찜). 링크 밖에 겹쳐 둔다 — 대화형 요소 중첩 금지 */
  overlayAction?: React.ReactNode;
  /** 수강 중일 때 진도 (0–100). 있으면 평점·가격 대신 진도를 보인다 */
  progress?: number | null;
  /** 진도 옆 문구 (예: 수료 완료) */
  progressLabel?: React.ReactNode;
  layout?: "vertical" | "horizontal";
  LinkComponent?: LinkLike;
  className?: string;
  headingLevel?: "h2" | "h3" | "h4";
}

export function CourseCard({
  href,
  title,
  media,
  typeLabel,
  provider,
  meta = [],
  rating,
  price,
  badge,
  overlayAction,
  progress,
  progressLabel,
  layout = "vertical",
  LinkComponent = "a",
  className,
  headingLevel: H = "h3",
}: CourseCardProps) {
  const L = LinkComponent;
  const metaText = meta.filter(Boolean).join(" · ");
  const eyebrow = [typeLabel, provider].filter(Boolean).join(" · ");
  const horizontal = layout === "horizontal";
  const hasProgress = typeof progress === "number";

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border border-line bg-canvas transition-colors hover:border-line-strong focus-within:border-line-strong",
        className,
      )}
    >
      <L href={href} className={cn("flex h-full", horizontal ? "flex-row items-stretch gap-4 p-3" : "flex-col")}>
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-surface-sunken",
            horizontal ? "aspect-video w-36 rounded-lg sm:w-44" : "aspect-video w-full",
          )}
        >
          {media}
          {badge && <div className="absolute left-3 top-3 flex gap-1">{badge}</div>}
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col", horizontal ? "py-1 pr-2" : "p-5")}>
          {eyebrow && <p className="truncate text-caption text-muted">{eyebrow}</p>}
          <H
            className={cn(
              "line-clamp-2 text-title text-ink decoration-1 underline-offset-4 group-hover:underline",
              eyebrow && "mt-1",
            )}
          >
            {title}
          </H>
          {metaText && <p className="mt-1.5 truncate text-caption text-muted">{metaText}</p>}
          {(hasProgress || rating || price !== undefined) && (
            <div className={cn("mt-auto", horizontal ? "pt-2" : "pt-4")}>
              {hasProgress ? (
                <div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-muted">{progressLabel ?? "진도"}</span>
                    <span className="tabular font-semibold text-ink">{Math.round(progress!)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden>
                    <div
                      className={cn("h-full rounded-full", progress! >= 100 ? "bg-success" : "bg-brand")}
                      style={{ width: `${Math.min(100, Math.max(0, progress!))}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  {rating ? (
                    <span className="inline-flex items-center gap-1 text-caption text-muted">
                      <svg viewBox="0 0 20 20" className="size-3.5 fill-amber-400" aria-hidden>
                        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                      </svg>
                      <span className="font-semibold text-ink">{rating.avg.toFixed(1)}</span>
                      <span>({rating.count.toLocaleString()})</span>
                      <span className="sr-only">후기 평점</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  {price !== undefined && <span className="text-body-sm font-bold text-ink">{price}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </L>
      {overlayAction && <div className="absolute right-3 top-3">{overlayAction}</div>}
    </div>
  );
}

export function CourseCardSkeleton({ layout = "vertical" }: { layout?: "vertical" | "horizontal" }) {
  if (layout === "horizontal") {
    return (
      <div className="flex gap-4 rounded-xl border border-line p-3">
        <div className="skeleton aspect-video w-36 sm:w-44" />
        <div className="flex-1 space-y-2 py-1">
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="skeleton aspect-video rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
