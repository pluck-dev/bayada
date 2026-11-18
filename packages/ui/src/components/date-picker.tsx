"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { HiddenValue, Popover } from "./popover";
import { triggerClass } from "./select";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s?: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};
const dayLabel = (d: Date) => `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${WEEK[d.getDay()]})`;

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
    {dir === "left" ? (
      <path d="M12.7 5.3a1 1 0 0 1 0 1.4L9.4 10l3.3 3.3a1 1 0 1 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 0z" />
    ) : (
      <path d="M7.3 14.7a1 1 0 0 1 0-1.4L10.6 10 7.3 6.7a1 1 0 0 1 1.4-1.4l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4 0z" />
    )}
  </svg>
);

/**
 * 네이티브 <input type="date"> 대체 — 한국어 달력 팝오버. 값 형식은 네이티브와 같다(YYYY-MM-DD).
 * 키보드: ←→ 하루, ↑↓ 일주일, PageUp/Down 한 달, Enter 선택, Esc 닫기.
 */
export function DatePicker({
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "날짜 선택",
  min,
  max,
  required,
  clearable = true,
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  required?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const v = value ?? inner;
  const sel = fromIso(v);
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState<Date>(sel ?? new Date());
  const btn = React.useRef<HTMLButtonElement>(null);
  const grid = React.useRef<HTMLDivElement>(null);
  const uid = React.useId();
  const triggerId = id ?? `${uid}-trigger`;
  const lo = fromIso(min);
  const hi = fromIso(max);
  const out = (d: Date) => (lo && d < lo) || (hi && d > hi);

  const set = (s: string) => {
    if (value === undefined) setInner(s);
    onChange?.(s);
  };

  React.useEffect(() => {
    if (!open) return;
    setCursor(sel ?? new Date());
    requestAnimationFrame(() => grid.current?.focus());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = React.useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const shift = (n: number, months = 0) =>
    setCursor((c) => {
      const d = new Date(c);
      if (months) d.setMonth(d.getMonth() + months);
      d.setDate(d.getDate() + n);
      return d;
    });

  const pick = (d: Date) => {
    if (out(d)) return;
    set(toIso(d));
    setCursor(d);
    setOpen(false);
    btn.current?.focus();
  };

  const today = toIso(new Date());

  return (
    <div className={cn("relative w-full", className)}>
      <HiddenValue name={name} value={v} required={required} />
      <button
        ref={btn}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass("md", open)}
      >
        <span className={cn("tabular truncate", !sel && "text-subtle")}>{sel ? dayLabel(sel) : placeholder}</span>
        <span className="flex shrink-0 items-center gap-1">
          {sel && clearable && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="날짜 지우기"
              onClick={(e) => {
                e.stopPropagation();
                set("");
              }}
              className="flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
                <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z" />
              </svg>
            </span>
          )}
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn("size-4", open ? "text-ink" : "text-muted")} aria-hidden>
            <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
            <path d="M3 8.5h14M7 2.8v3.4M13 2.8v3.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <Popover anchor={btn.current} open={open} onClose={() => setOpen(false)} matchWidth={false} minWidth={312} maxHeight={380}>
        <div className="p-2" role="dialog" aria-label="날짜 선택">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(0, -1)}
              aria-label="이전 달"
              className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <Chevron dir="left" />
            </button>
            <span className="tabular text-body font-bold tracking-tight">
              {cursor.getFullYear()}. {pad(cursor.getMonth() + 1)}
            </span>
            <button
              type="button"
              onClick={() => shift(0, 1)}
              aria-label="다음 달"
              className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <Chevron dir="right" />
            </button>
          </div>
          <div
            ref={grid}
            tabIndex={0}
            role="grid"
            aria-label={`${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`}
            onKeyDown={(e) => {
              const map: Record<string, [number, number]> = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [-7, 0],
                ArrowDown: [7, 0],
                PageUp: [0, -1],
                PageDown: [0, 1],
              };
              const movement = map[e.key];
              if (movement) {
                e.preventDefault();
                shift(...movement);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pick(cursor);
              }
            }}
            className="grid grid-cols-7 gap-0.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-line"
          >
            {WEEK.map((w, i) => (
              <span key={w} className={cn("py-1.5 text-center text-micro font-bold", i === 0 ? "text-brand" : i === 6 ? "text-info" : "text-subtle")}>
                {w}
              </span>
            ))}
            {days.map((d) => {
              const iso = toIso(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const on = !!sel && iso === toIso(sel);
              const cur = iso === toIso(cursor);
              const dow = d.getDay();
              return (
                <button
                  key={iso}
                  type="button"
                  tabIndex={-1}
                  disabled={!!out(d)}
                  onClick={() => pick(d)}
                  aria-pressed={on}
                  aria-label={dayLabel(d)}
                  className={cn(
                    "tabular relative flex h-10 items-center justify-center rounded-full text-body-sm transition-colors disabled:cursor-not-allowed disabled:opacity-25",
                    on ? "bg-ink font-bold text-white" : cur ? "bg-surface-sunken font-bold" : "hover:bg-surface-sunken",
                    !on && !inMonth && "text-disabled",
                    !on && inMonth && dow === 0 && "text-brand",
                    !on && inMonth && dow === 6 && "text-info",
                  )}
                >
                  {d.getDate()}
                  {iso === today && <span className={cn("absolute bottom-1 size-1 rounded-full", on ? "bg-white" : "bg-brand")} />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between border-t border-line-soft pt-2 text-body-sm font-semibold">
            <button type="button" onClick={() => pick(new Date())} className="rounded-full px-3 py-1.5 transition-colors hover:bg-surface-sunken">
              오늘
            </button>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  set("");
                  setOpen(false);
                }}
                className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                지우기
              </button>
            )}
          </div>
        </div>
      </Popover>
    </div>
  );
}
