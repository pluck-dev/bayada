import * as React from "react";

import { cn } from "../lib/cn";
import type { LinkLike } from "./link";

/**
 * 단 하나의 프로그램 카드. 홈·카탈로그·마이 러닝·패스웨이가 모두 이걸 쓴다.
 *
 * 카드 해부 (위→아래, 정보 우선순위 순)
 *   1. 표지 16:9, 둥근 모서리 (+ 좌상단 상태 배지, 우상단 오버레이 행동 1개)
 *   2. 분야 · 유형 (한 줄, caption)
 *   3. 제목 (2줄 제한, title)
 *   4. 태그 (난이도 · 대상 직군 — 작은 회색 알약)
 *   5. 수치 (분량 · 강의 수 · 수강자 수 — 아이콘 + 숫자)
 *   6. 하단 선 아래: 진도 막대, 또는 평점 / 가격
 * 바깥 테두리 없음 — 표지가 카드의 윤곽. hover 는 표지 살짝 확대 + 제목 밑줄.
 */
export interface CourseCardStat {
  icon: React.ReactNode;
  label: string;
  /** 화면 낭독기용 설명 (예: "총 학습 시간") */
  srLabel?: string;
}

export interface CourseCardProps {
  href: string;
  title: string;
  /** 표지 요소 (앱이 이미지/자동 표지를 결정) */
  media: React.ReactNode;
  /** 유형 라벨 (예: 단과 강좌) */
  typeLabel?: string;
  /** 분야·제공기관 등 — 유형 앞에 붙는다 */
  provider?: string;
  /** 회색 알약 태그 (난이도, 대상 직군). 노드를 주면 그대로(예: 사내 전용 배지) */
  tags?: Array<React.ReactNode>;
  /** 아이콘 수치 (분량·강의 수·수강자 수) */
  stats?: Array<CourseCardStat | null | undefined | false>;
  /** 옛 메타 한 줄 (패스웨이 카드 등) */
  meta?: Array<string | null | undefined | false>;
  rating?: { avg: number; count: number } | null;
  price?: React.ReactNode;
  /** 표지 좌상단 배지 (사내 전용 등) */
  badge?: React.ReactNode;
  /** 표지 우상단 행동 (찜). 링크 밖에 겹쳐 둔다 — 대화형 요소 중첩 금지 */
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
  tags = [],
  stats = [],
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
  const eyebrow = [provider, typeLabel].filter(Boolean).join(" · ");
  const horizontal = layout === "horizontal";
  const hasProgress = typeof progress === "number";
  const tagList = tags.filter((t) => t !== null && t !== undefined && t !== false && t !== "");
  const statList = stats.filter((s): s is CourseCardStat => !!s);
  const hasFooter = hasProgress || !!rating || price !== undefined;

  return (
    <div className={cn("group relative h-full", className)}>
      <L
        href={href}
        className={cn(
          "flex h-full rounded-2xl outline-offset-4",
          horizontal ? "flex-row items-stretch gap-4" : "flex-col",
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-2xl bg-surface-sunken ring-1 ring-black/5 ring-inset",
            horizontal ? "aspect-video w-36 sm:w-48" : "aspect-video w-full",
          )}
        >
          <div className="h-full w-full transition-transform duration-500 ease-(--ease-out) group-hover:scale-[1.03]">
            {media}
          </div>
          {badge && <div className="absolute left-3 top-3 flex gap-1">{badge}</div>}
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col", horizontal ? "py-1" : "px-1 pt-4")}>
          {eyebrow && <p className="truncate text-caption font-medium text-muted">{eyebrow}</p>}
          <H
            className={cn(
              "line-clamp-2 text-title font-bold text-ink decoration-1 underline-offset-4 group-hover:underline",
              eyebrow && "mt-1",
            )}
          >
            {title}
          </H>
          {tagList.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tagList.map((t, i) =>
                typeof t === "string" ? (
                  <span key={t} className="inline-flex h-6 items-center rounded-full bg-surface-sunken px-2.5 text-micro font-semibold text-ink-soft">
                    {t}
                  </span>
                ) : (
                  <React.Fragment key={i}>{t}</React.Fragment>
                ),
              )}
            </div>
          )}
          {statList.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
              {statList.map((s) => (
                <li key={s.label} className="inline-flex items-center gap-1 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-subtle">
                  {s.icon}
                  {s.srLabel && <span className="sr-only">{s.srLabel}</span>}
                  <span className="tabular">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
          {metaText && <p className="mt-1.5 line-clamp-1 text-caption text-muted">{metaText}</p>}
          {hasFooter && (
            <div className={cn("mt-auto", horizontal ? "pt-2" : "pt-3")}>
              <div>
                {hasProgress ? (
                  <div>
                    <div className="flex items-center justify-between text-caption">
                      <span className={cn("font-medium", progress! >= 100 ? "text-success" : "text-muted")}>
                        {progressLabel ?? "진도"}
                      </span>
                      <span className="tabular font-bold text-ink">{Math.round(progress!)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden>
                      <div
                        className={cn("h-full rounded-full", progress! >= 100 ? "bg-success" : "bg-brand")}
                        style={{ width: `${Math.min(100, Math.max(0, progress!))}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row-reverse items-center justify-between gap-2">
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
            </div>
          )}
        </div>
      </L>
      {overlayAction && <div className={cn("absolute", horizontal ? "right-0 top-0" : "right-3 top-3")}>{overlayAction}</div>}
    </div>
  );
}

export function CourseCardSkeleton({ layout = "vertical" }: { layout?: "vertical" | "horizontal" }) {
  if (layout === "horizontal") {
    return (
      <div className="flex gap-4">
        <div className="skeleton aspect-video w-36 rounded-2xl sm:w-48" />
        <div className="flex-1 space-y-2 py-1">
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="skeleton aspect-video rounded-2xl" />
      <div className="space-y-3 px-1 pt-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="flex gap-1.5">
          <div className="skeleton h-6 w-12 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
