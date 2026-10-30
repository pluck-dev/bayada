import * as React from "react";

import { cn } from "../lib/cn";
import type { LinkLike } from "./link";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
}

/** 이동 경로. 마지막 항목 = 현재 페이지(링크 없음) */
export function Breadcrumb({
  items,
  LinkComponent = "a",
  className,
}: {
  items: BreadcrumbItem[];
  LinkComponent?: LinkLike;
  className?: string;
}) {
  const L = LinkComponent;
  return (
    <nav aria-label="이동 경로" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-muted">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {it.href && !last ? (
                <L href={it.href} className="truncate hover:text-ink hover:underline underline-offset-4">
                  {it.label}
                </L>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "text-ink-soft")}>
                  {it.label}
                </span>
              )}
              {!last && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5 shrink-0 text-disabled" aria-hidden>
                  <path d="M7.3 5.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4L10.6 10 7.3 6.7a1 1 0 0 1 0-1.4z" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 페이지 번호 (URL 기반). 현재 ±2 쪽 + 처음/끝 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  LinkComponent = "a",
  size = "md",
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  LinkComponent?: LinkLike;
  size?: "sm" | "md";
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const L = LinkComponent;
  const pages: Array<number | "gap"> = [];
  const lo = Math.max(1, page - 2);
  const hi = Math.min(totalPages, page + 2);
  if (lo > 1) pages.push(1);
  if (lo > 2) pages.push("gap");
  for (let p = lo; p <= hi; p++) pages.push(p);
  if (hi < totalPages - 1) pages.push("gap");
  if (hi < totalPages) pages.push(totalPages);

  const cell = cn(
    "tabular inline-flex items-center justify-center rounded-lg font-medium transition-colors",
    size === "sm" ? "h-7 min-w-7 px-2 text-caption rounded-md" : "h-10 min-w-10 px-3 text-body-sm",
  );
  const idle = "text-ink-soft hover:bg-surface-sunken hover:text-ink";
  const chevron = (dir: "l" | "r") => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path
        d={
          dir === "l"
            ? "M12.7 5.3a1 1 0 0 1 0 1.4L9.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 0z"
            : "M7.3 5.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4L10.6 10 7.3 6.7a1 1 0 0 1 0-1.4z"
        }
      />
    </svg>
  );

  return (
    <nav aria-label="페이지" className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <L href={hrefFor(page - 1)} aria-label="이전 페이지" className={cn(cell, idle)}>
          {chevron("l")}
        </L>
      ) : (
        <span className={cn(cell, "text-disabled")} aria-hidden>
          {chevron("l")}
        </span>
      )}
      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className={cn(cell, "text-subtle")} aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={cn(cell, "bg-ink text-white")}>
            {p}
          </span>
        ) : (
          <L key={p} href={hrefFor(p)} className={cn(cell, idle)}>
            {p}
          </L>
        ),
      )}
      {page < totalPages ? (
        <L href={hrefFor(page + 1)} aria-label="다음 페이지" className={cn(cell, idle)}>
          {chevron("r")}
        </L>
      ) : (
        <span className={cn(cell, "text-disabled")} aria-hidden>
          {chevron("r")}
        </span>
      )}
    </nav>
  );
}
