"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@bayada/ui";
import { Popover } from "./popover";
import { triggerClass, type FieldSize } from "./styles";
import { FormValue } from "./FormValue";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s?: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};
const timeOf = (s?: string) => {
  const m = s?.match(/T(\d{2}):(\d{2})/);
  return m ? { h: Number(m[1]), m: Number(m[2]) } : null;
};
const dayLabel = (d: Date) => `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${WEEK[d.getDay()]})`;
const timeLabel = (t: { h: number; m: number }) => `${t.h < 12 ? "오전" : "오후"} ${t.h % 12 === 0 ? 12 : t.h % 12}:${pad(t.m)}`;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

/**
 * 네이티브 <input type="date" | "datetime-local"> 대체 — 한국어 달력 팝오버.
 * 값 형식은 네이티브와 같다: date = YYYY-MM-DD, datetime = YYYY-MM-DDTHH:mm (KST 해석은 서버 lib/kst.ts 그대로).
 * 키보드: ←→ 하루, ↑↓ 일주일, PageUp/Down 한 달, Enter 선택, Esc 닫기.
 */
export function DatePicker({
  name,
  value,
  defaultValue,
  onChange,
  mode = "date",
  placeholder,
  size = "md",
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
  mode?: "date" | "datetime";
  placeholder?: string;
  size?: FieldSize;
  min?: string;
  max?: string;
  required?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const v = value ?? inner;
  const sel = fromIso(v);
  const time = timeOf(v);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(sel ?? new Date());
  const btn = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const hourCol = useRef<HTMLDivElement>(null);
  const minCol = useRef<HTMLDivElement>(null);
  const uid = useId();
  const triggerId = id ?? `${uid}-trigger`;
  const lo = fromIso(min);
  const hi = fromIso(max);
  const out = (d: Date) => (lo && d < lo) || (hi && d > hi);
  const dt = mode === "datetime";

  const set = (s: string) => {
    if (value === undefined) setInner(s);
    onChange?.(s);
  };
  const compose = (d: Date, t: { h: number; m: number } | null) =>
    dt ? `${toIso(d)}T${pad(t?.h ?? 9)}:${pad(t?.m ?? 0)}` : toIso(d);

  useEffect(() => {
    if (!open) return;
    setCursor(sel ?? new Date());
    requestAnimationFrame(() => {
      grid.current?.focus();
      hourCol.current?.querySelector<HTMLElement>("[data-on=true]")?.scrollIntoView({ block: "center" });
      minCol.current?.querySelector<HTMLElement>("[data-on=true]")?.scrollIntoView({ block: "center" });
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
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
    set(compose(d, time));
    setCursor(d);
    // 날짜만이면 바로 닫는다. 일시는 시간까지 고르게 열어 둔다
    if (!dt) {
      setOpen(false);
      btn.current?.focus();
    }
  };
  const pickTime = (patch: Partial<{ h: number; m: number }>) => {
    const base = sel ?? cursor;
    set(compose(base, { h: time?.h ?? 9, m: time?.m ?? 0, ...patch }));
  };

  const today = toIso(new Date());
  const shown = sel ? (dt && time ? `${dayLabel(sel)} ${timeLabel(time)}` : dayLabel(sel)) : (placeholder ?? (dt ? "날짜·시간 선택" : "날짜 선택"));
  // 5분 단위가 아닌 기존 값(예: 14:07)도 목록에 보이게
  const minutes = time && !MINUTES.includes(time.m) ? [...MINUTES, time.m].sort((a, b) => a - b) : MINUTES;

  return (
    <div className={cn("relative", size === "sm" ? "w-auto" : "w-full", className)}>
      <FormValue name={name} value={v} required={required} proxyFor={triggerId} />
      <button
        ref={btn}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClass(size, open), size === "sm" && "min-w-[132px]")}
      >
        <span className={cn("num truncate", !sel && "text-subtle")}>{shown}</span>
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
              className="flex size-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash-strong hover:text-ink"
            >
              <X className="size-3" strokeWidth={2.5} aria-hidden />
            </span>
          )}
          <CalendarDays className={cn("size-4", open ? "text-ink" : "text-muted")} aria-hidden />
        </span>
      </button>

      <Popover
        anchor={btn.current}
        open={open}
        onClose={() => setOpen(false)}
        matchWidth={false}
        minWidth={dt ? 424 : 308}
        maxHeight={380}
      >
        <div className="flex" role="dialog" aria-label={dt ? "날짜·시간 선택" : "날짜 선택"}>
          <div className="w-[296px] shrink-0 p-2">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shift(0, -1)}
                aria-label="이전 달"
                className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-wash hover:text-ink"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="num text-[15px] font-extrabold tracking-[-0.02em]">
                {cursor.getFullYear()}. {pad(cursor.getMonth() + 1)}
              </span>
              <button
                type="button"
                onClick={() => shift(0, 1)}
                aria-label="다음 달"
                className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-wash hover:text-ink"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div
              ref={grid}
              tabIndex={0}
              role="grid"
              aria-label={`${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`}
              onKeyDown={(e) => {
                const k = e.key;
                const map: Record<string, [number, number]> = {
                  ArrowLeft: [-1, 0],
                  ArrowRight: [1, 0],
                  ArrowUp: [-7, 0],
                  ArrowDown: [7, 0],
                  PageUp: [0, -1],
                  PageDown: [0, 1],
                };
                if (map[k]) {
                  e.preventDefault();
                  shift(...map[k]);
                } else if (k === "Enter" || k === " ") {
                  e.preventDefault();
                  pick(cursor);
                }
              }}
              className="grid grid-cols-7 gap-0.5 rounded-xl outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-line)]"
            >
              {WEEK.map((w, i) => (
                <span
                  key={w}
                  className={cn("py-1.5 text-center text-[11.5px] font-bold", i === 0 ? "text-brand" : i === 6 ? "text-info" : "text-subtle")}
                >
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
                    className={cn(
                      "num relative flex h-9 items-center justify-center rounded-full text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-25",
                      on ? "bg-ink font-bold text-white" : cur ? "bg-wash font-bold" : "hover:bg-wash",
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
            <div className="mt-2 flex justify-between border-t border-hairline pt-2 text-[13px] font-bold">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCursor(now);
                  pick(now);
                }}
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-wash"
              >
                오늘
              </button>
              <div className="flex gap-1">
                {clearable && (
                  <button
                    type="button"
                    onClick={() => {
                      set("");
                      setOpen(false);
                    }}
                    className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-wash hover:text-ink"
                  >
                    지우기
                  </button>
                )}
                {dt && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      btn.current?.focus();
                    }}
                    className="rounded-full bg-ink px-3.5 py-1.5 text-white transition-colors hover:bg-black"
                  >
                    완료
                  </button>
                )}
              </div>
            </div>
          </div>

          {dt && (
            <div className="flex w-[120px] shrink-0 flex-col border-l border-hairline pl-1.5">
              <p className="px-2 pb-1 pt-3 text-center text-[11.5px] font-bold text-subtle">시간</p>
              <div className="flex min-h-0 flex-1 gap-1">
                {(
                  [
                    { ref: hourCol, items: HOURS, cur: time?.h, label: "시", key: "h" as const },
                    { ref: minCol, items: minutes, cur: time?.m, label: "분", key: "m" as const },
                  ]
                ).map((col) => (
                  <div
                    key={col.key}
                    ref={col.ref}
                    role="listbox"
                    aria-label={col.label}
                    className="h-[296px] flex-1 overflow-y-auto pb-2"
                  >
                    {col.items.map((n) => {
                      const on = col.cur === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="option"
                          aria-selected={on}
                          data-on={on}
                          onClick={() => pickTime({ [col.key]: n })}
                          className={cn(
                            "num mb-0.5 flex h-8 w-full items-center justify-center rounded-lg text-[13px] transition-colors",
                            on ? "bg-ink font-bold text-white" : "text-ink-soft hover:bg-wash",
                          )}
                        >
                          {pad(n)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}
