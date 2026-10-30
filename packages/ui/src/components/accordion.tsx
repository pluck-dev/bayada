import * as React from "react";

import { cn } from "../lib/cn";

/**
 * <details> 기반 아코디언 — JS 없이 동작, 서버 컴포넌트에서 사용 가능.
 * - divided : 항목 사이 구분선만 (기본, FAQ)
 * - boxed   : 바깥 테두리 + 구분선 (커리큘럼처럼 목록 자체가 덩어리일 때)
 */
export interface AccordionItem {
  id?: string;
  title: React.ReactNode;
  /** 제목 오른쪽 보조 정보 (예: 8개 · 45분) */
  meta?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({
  items,
  variant = "divided",
  size = "md",
  className,
}: {
  items: AccordionItem[];
  variant?: "divided" | "boxed";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-line",
        variant === "boxed" ? "overflow-hidden rounded-xl border border-line" : "border-y border-line",
        className,
      )}
    >
      {items.map((item, i) => (
        <AccordionRow key={item.id ?? i} item={item} size={size} padded={variant === "boxed"} />
      ))}
    </div>
  );
}

function AccordionRow({ item, size, padded }: { item: AccordionItem; size: "sm" | "md"; padded: boolean }) {
  return (
    <details className="group" open={item.defaultOpen} id={item.id}>
      <summary
        className={cn(
          "flex items-center justify-between gap-4 font-semibold text-ink transition-colors hover:text-brand-700",
          size === "sm" ? "py-3 text-body-sm" : "py-5 text-body",
          padded && (size === "sm" ? "px-4" : "px-5"),
        )}
      >
        <span className="min-w-0">{item.title}</span>
        <span className="flex shrink-0 items-center gap-3">
          {item.meta && <span className="text-caption font-normal text-muted">{item.meta}</span>}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5 text-subtle transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
          </svg>
        </span>
      </summary>
      <div
        className={cn(
          "text-muted",
          size === "sm" ? "pb-3 text-body-sm" : "pb-6 text-body",
          padded && (size === "sm" ? "px-4" : "px-5"),
        )}
      >
        {item.content}
      </div>
    </details>
  );
}
