"use client";

import { useId, useState, type ReactNode } from "react";

export interface TabItem {
  key: string;
  label: ReactNode;
  content: ReactNode;
}

/** 서버에서 미리 렌더한 패널을 탭으로 전환 (pill / underline 두 가지) */
export function Tabs({
  items,
  variant = "underline",
  ariaLabel,
}: {
  items: TabItem[];
  variant?: "pill" | "underline";
  ariaLabel: string;
}) {
  const [active, setActive] = useState(items[0]?.key);
  const id = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={
          variant === "pill"
            ? "no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
            : "no-scrollbar flex gap-6 overflow-x-auto border-b border-line"
        }
        onKeyDown={(e) => {
          const idx = items.findIndex((t) => t.key === active);
          if (e.key === "ArrowRight") setActive(items[(idx + 1) % items.length].key);
          if (e.key === "ArrowLeft") setActive(items[(idx - 1 + items.length) % items.length].key);
        }}
      >
        {items.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.key)}
              className={
                variant === "pill"
                  ? `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-ink-soft hover:border-ink-soft hover:text-ink"
                    }`
                  : `-mb-px shrink-0 border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
                      selected ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                    }`
              }
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
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
