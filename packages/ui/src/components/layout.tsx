import * as React from "react";

import { cn } from "../lib/cn";

/**
 * 콘텐츠 폭: page 1200 (일반) · reading 760 (본문·약관·폼 한 줄 길이) · auth 440 (로그인 카드)
 */
export function Container({
  size = "page",
  className,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { size?: "page" | "reading" | "auth"; as?: "div" | "section" | "main" | "header" }) {
  return (
    <Tag
      className={cn(
        size === "page" ? "container-page" : size === "reading" ? "container-reading" : "mx-auto w-full max-w-auth px-5",
        className,
      )}
      {...props}
    />
  );
}

const GAP = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
} as const;

/** 쌓기. gap 은 4px 배수 스케일만 */
export function Stack({
  gap = 4,
  direction = "col",
  align,
  justify,
  wrap,
  className,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  gap?: keyof typeof GAP;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  as?: "div" | "section" | "ul" | "ol";
}) {
  return (
    <Tag
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        GAP[gap],
        align && { start: "items-start", center: "items-center", end: "items-end", baseline: "items-baseline", stretch: "items-stretch" }[align],
        justify && { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" }[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

/**
 * 페이지 머리글 — 모든 페이지의 첫 블록. (eyebrow) → 제목 → 설명, 오른쪽에 행동.
 * size: lg(학습자 페이지) / compact(어드민).
 * 배경·테두리 없음. 페이지 성격 차이는 내용으로, 머리글 모양은 언제나 같다.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  breadcrumb,
  back,
  meta,
  size = "lg",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  /** <Breadcrumb/> 또는 뒤로가기 링크 요소 */
  breadcrumb?: React.ReactNode;
  back?: React.ReactNode;
  /** 제목 아래 배지·메타 줄 */
  meta?: React.ReactNode;
  size?: "lg" | "compact";
  className?: string;
}) {
  const compact = size === "compact";
  return (
    <header className={cn(compact ? "mb-5" : "mb-8 md:mb-10", className)}>
      {(breadcrumb || back) && <div className={compact ? "mb-2" : "mb-4"}>{breadcrumb ?? back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && (
            <p className={cn("font-semibold text-brand-700", compact ? "mb-1 text-micro" : "mb-2 text-body-sm")}>{eyebrow}</p>
          )}
          <h1 className={cn("text-ink", compact ? "text-[20px] font-bold leading-tight tracking-tight" : "text-[30px] font-extrabold leading-[1.2] tracking-[-0.03em] md:text-[40px]")}>
            {title}
          </h1>
          {description && (
            <p className={cn("text-muted", compact ? "mt-1 text-caption" : "mt-3 text-body-lg")}>{description}</p>
          )}
          {meta && <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-2" : "mt-4")}>{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/**
 * 섹션 머리글 — 페이지 안 큰 묶음의 시작. 제목(h2) + 설명 + 오른쪽 '전체 보기' 류 링크 1개.
 */
export function SectionHeader({
  title,
  description,
  action,
  as: H = "h2",
  size = "md",
  id,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h2" | "h3";
  size?: "sm" | "md" | "lg";
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", size === "lg" ? "mb-8" : size === "md" ? "mb-6" : "mb-4", className)}>
      <div className="min-w-0">
        <H
          id={id}
          className={cn(
            "text-ink",
            size === "lg"
              ? "text-[26px] font-extrabold leading-[1.25] tracking-[-0.03em] md:text-[34px]"
              : size === "md"
                ? "text-[22px] font-extrabold leading-snug tracking-[-0.025em] md:text-[24px]"
                : "text-h3 font-bold",
          )}
        >
          {title}
        </H>
        {description && <p className={cn("text-muted", size === "sm" ? "mt-1 text-body-sm" : "mt-2 text-body")}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** 정의 목록형 메타 (라벨: 값) — 상세 화면 요약. 테두리 없이 열 맞춤 */
export function DescriptionList({
  items,
  columns = 2,
  className,
}: {
  items: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-8 gap-y-4",
        columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-caption text-muted">{it.label}</dt>
          <dd className="mt-1 text-body-sm font-semibold text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
