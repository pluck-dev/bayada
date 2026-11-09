"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import type { LinkLike } from "./link";

/**
 * 탭: 같은 페이지 안 패널 전환.
 * - underline : 페이지·섹션 수준 (기본)
 * - pill      : 필터성 선택 (직군 고르기 등) — 선택된 것만 진한 칩
 */
export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

const listClass = {
  underline: "no-scrollbar flex gap-6 overflow-x-auto border-b border-line",
  pill: "no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0",
};

export function tabTriggerClass(variant: "underline" | "pill", selected: boolean, size: "sm" | "md" = "md") {
  return variant === "pill"
    ? cn(
        "shrink-0 rounded-full border font-semibold transition-colors",
        size === "sm" ? "h-8 px-3 text-caption" : "h-10 px-4 text-body-sm",
        selected ? "border-ink bg-ink text-white" : "border-transparent bg-surface-sunken text-ink-soft hover:bg-neutral-200 hover:text-ink",
      )
    : cn(
        "-mb-px shrink-0 border-b-2 font-semibold transition-colors",
        size === "sm" ? "pb-2.5 text-body-sm" : "pb-3 text-body",
        selected ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
      );
}

export function Tabs({
  items,
  variant = "underline",
  size = "md",
  ariaLabel,
  defaultValue,
  value,
  onValueChange,
  panelClassName = "pt-6",
}: {
  items: TabItem[];
  variant?: "underline" | "pill";
  size?: "sm" | "md";
  ariaLabel: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (key: string) => void;
  panelClassName?: string;
}) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.key);
  const active = value ?? inner;
  const setActive = (k: string) => {
    setInner(k);
    onValueChange?.(k);
  };
  const id = React.useId();
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (dir: 1 | -1) => {
    const idx = items.findIndex((t) => t.key === active);
    const next = items[(idx + dir + items.length) % items.length]?.key;
    if (!next) return;
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={listClass[variant]}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        {items.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              ref={(el) => {
                refs.current[t.key] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.key)}
              className={tabTriggerClass(variant, selected, size)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`${id}-panel-${t.key}`}
          aria-labelledby={`${id}-tab-${t.key}`}
          hidden={t.key !== active}
          className={panelClassName}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

/** 라우트가 다른 탭 (마이 러닝 하위 메뉴, 어드민 하위 화면) — 링크 + aria-current */
export function TabNav({
  items,
  ariaLabel,
  variant = "underline",
  size = "md",
  LinkComponent = "a",
  className,
}: {
  items: Array<{ href: string; label: React.ReactNode; active: boolean; count?: number }>;
  ariaLabel: string;
  variant?: "underline" | "pill";
  size?: "sm" | "md";
  LinkComponent?: LinkLike;
  className?: string;
}) {
  const L = LinkComponent;
  return (
    <nav aria-label={ariaLabel} className={cn(listClass[variant], className)}>
      {items.map((t) => (
        <L
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(tabTriggerClass(variant, t.active, size), "inline-flex items-center gap-1.5")}
        >
          {t.label}
          {t.count !== undefined && t.count > 0 && (
            <span
              className={cn(
                "tabular rounded-full px-1.5 text-micro font-semibold",
                t.active && variant === "pill" ? "bg-white/20 text-white" : "bg-surface-sunken text-ink-soft",
              )}
            >
              {t.count}
            </span>
          )}
        </L>
      ))}
    </nav>
  );
}
