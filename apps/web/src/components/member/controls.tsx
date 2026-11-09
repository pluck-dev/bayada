"use client";

// 마이페이지 디자인된 컨트롤 — 네이티브 select·checkbox·radio·date·confirm 대체 (홈페이지 전용, @bayada/ui 아카데미 키트와 같은 동작 규칙).
// name 을 주면 숨은 input 으로 FormData 에 실린다.
import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { cn } from "@bayada/ui";
import { btnClass } from "./ui";

// ─── 떠 있는 패널 ───
function Popover({
  anchor,
  open,
  onClose,
  children,
  minWidth,
  matchWidth = true,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
  matchWidth?: boolean;
}) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchor) {
      setPos(null);
      return;
    }
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const width = Math.min(Math.max(matchWidth ? r.width : 0, minWidth ?? 0), window.innerWidth - 16);
      const below = window.innerHeight - r.bottom;
      const up = below < 300 && r.top > below;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      setPos({ top: up ? r.top - 6 : r.bottom + 6, left, width, up });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, matchWidth, minWidth]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel?.contains(t) || anchor?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        anchor?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, anchor, panel, onClose]);

  if (typeof document === "undefined" || !open || !pos) return null;
  return createPortal(
    <div
      ref={setPanel}
      style={{
        position: "fixed",
        left: pos.left,
        width: pos.width,
        ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
        zIndex: 90,
      }}
      className="member-pop overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
    >
      {children}
    </div>,
    document.body,
  );
}

function HiddenValue({ name, value, required }: { name?: string; value: string; required?: boolean }) {
  if (!name) return null;
  if (!required) return <input type="hidden" name={name} value={value} />;
  return (
    <input
      name={name}
      value={value}
      required
      onChange={() => {}}
      tabIndex={-1}
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-4 size-px opacity-0"
    />
  );
}

const triggerClass = (open: boolean) =>
  cn(
    "flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-left text-[15px] text-[color:var(--fg)] outline-none transition-[border-color,box-shadow]",
    open ? "border-[#ce0e2d] ring-4 ring-[#ce0e2d]/10" : "border-[color:var(--border)] hover:border-gray-400",
    "focus-visible:border-[#ce0e2d] focus-visible:ring-4 focus-visible:ring-[#ce0e2d]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
  );

// ─── 선택 목록 ───
export type Option = { value: string; label: string; hint?: string; disabled?: boolean };

export function Select({
  id,
  name,
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "선택해 주세요",
  required,
  disabled,
  "aria-label": ariaLabel,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const v = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const btn = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const uid = React.useId();
  const sel = options.find((o) => o.value === v);

  const choose = (o: Option) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === v)));
    requestAnimationFrame(() => list.current?.focus());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (d: number) => {
    let i = active;
    for (let k = 0; k < options.length; k++) {
      i = (i + d + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  return (
    <div className="relative w-full">
      <HiddenValue name={name} value={v} required={required} />
      <button
        ref={btn}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClass(open)}
      >
        <span className={cn("min-w-0 truncate", !sel && "text-gray-400")}>{sel ? sel.label : placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-gray-500 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <Popover anchor={btn.current} open={open} onClose={() => setOpen(false)} minWidth={200}>
        <ul
          ref={list}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${uid}-${active}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), move(1));
            else if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
            else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (options[active]) choose(options[active]);
            } else if (e.key === "Tab") setOpen(false);
          }}
          className="max-h-[300px] overflow-y-auto outline-none"
        >
          {options.map((o, i) => {
            const on = o.value === v;
            return (
              <li
                key={o.value || `__${i}`}
                id={`${uid}-${i}`}
                role="option"
                aria-selected={on}
                aria-disabled={o.disabled || undefined}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px]",
                  i === active && "bg-[#f0f4f7]",
                  on ? "font-semibold text-[color:var(--fg)]" : "text-gray-700",
                  o.disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{o.label}</span>
                  {o.hint && <span className="block truncate text-xs font-normal text-gray-500">{o.hint}</span>}
                </span>
                {on && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );
}

// ─── 날짜 선택 (YYYY-MM-DD) ───
const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  required,
  placeholder = "날짜 선택",
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const v = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const btn = React.useRef<HTMLButtonElement>(null);
  const base = v || min || toYmd(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const [view, setView] = React.useState(() => ({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }));
  React.useEffect(() => {
    if (open) {
      const b = v || min || base;
      setView({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const label = v ? new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${v}T00:00:00Z`)) : "";
  const shift = (d: number) => setView(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const pick = (ymd: string) => {
    if (value === undefined) setInner(ymd);
    onChange?.(ymd);
    setOpen(false);
    btn.current?.focus();
  };

  return (
    <div className="relative w-full">
      <HiddenValue name={name} value={v} required={required} />
      <button ref={btn} id={id} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={triggerClass(open)}>
        <span className={cn("truncate", !v && "text-gray-400")}>{v ? label : placeholder}</span>
        <CalendarDays className="size-4 shrink-0 text-gray-500" aria-hidden />
      </button>
      <Popover anchor={btn.current} open={open} onClose={() => setOpen(false)} minWidth={300} matchWidth={false}>
        <div className="p-2" role="dialog" aria-label="날짜 선택">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100" aria-label="이전 달">
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-[15px] font-bold">
              {view.y}년 {view.m + 1}월
            </p>
            <button type="button" onClick={() => shift(1)} className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100" aria-label="다음 달">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEK.map((w, i) => (
              <span key={w} className={cn("py-1 text-xs font-semibold text-gray-400", i === 0 && "text-red-400")}>
                {w}
              </span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const ymd = toYmd(view.y, view.m, d);
              const off = (!!min && ymd < min) || (!!max && ymd > max);
              const on = ymd === v;
              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={off}
                  onClick={() => pick(ymd)}
                  aria-pressed={on}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                    on ? "bg-[#ce0e2d] font-bold text-white" : "hover:bg-gray-100",
                    off && "cursor-not-allowed text-gray-300 hover:bg-transparent",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </Popover>
    </div>
  );
}

// ─── 체크박스·스위치 ───
export function Checkbox({
  name,
  checked,
  defaultChecked,
  onChange,
  children,
  description,
  required,
}: {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  children: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
}) {
  const [inner, setInner] = React.useState(!!defaultChecked);
  const on = checked ?? inner;
  return (
    <label className="group flex cursor-pointer items-start gap-3">
      {/* 폼 값·필수 검증은 화면 밖 네이티브 입력, 모양은 디자인된 상자 */}
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={on}
        required={required}
        onChange={(e) => {
          if (checked === undefined) setInner(e.target.checked);
          onChange?.(e.target.checked);
        }}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-[#ce0e2d]/15",
          on ? "border-[#ce0e2d] bg-[#ce0e2d] text-white" : "border-gray-300 bg-white group-hover:border-gray-400",
        )}
      >
        {on && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0 text-[15px] leading-snug text-[color:var(--fg)]">
        {children}
        {description && <span className="mt-0.5 block text-sm text-[color:var(--muted)]">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[color:var(--fg)]">{label}</p>
        {description && <p className="mt-0.5 text-sm text-[color:var(--muted)]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ce0e2d]/15 disabled:opacity-50",
          checked ? "bg-[#ce0e2d]" : "bg-gray-300",
        )}
      >
        <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-[left]", checked ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}

// ─── 알약 선택 (단일=라디오, 여러 개=체크) ───
export function ChoiceChips({
  name,
  options,
  value,
  onChange,
  multiple,
  columns,
  "aria-label": ariaLabel,
}: {
  name?: string;
  options: Option[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  columns?: 2 | 3 | 4;
  "aria-label"?: string;
}) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (val: string) => {
    if (multiple) onChange(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
    else onChange(val);
  };
  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      className={cn(
        "grid gap-2",
        columns === 2 && "grid-cols-2",
        columns === 3 && (options.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"),
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        !columns && "flex flex-wrap",
      )}
    >
      {name && list.map((x) => <input key={x} type="hidden" name={name} value={x} />)}
      {options.map((o) => {
        const on = list.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => toggle(o.value)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-left text-sm font-semibold transition-colors disabled:opacity-40",
              on ? "border-[#ce0e2d] bg-red-50 text-[#ce0e2d]" : "border-[color:var(--border)] bg-white text-gray-700 hover:border-gray-400",
              columns && "justify-start",
            )}
          >
            {on && multiple && <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />}
            <span className="min-w-0">
              <span className="block">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-xs font-normal text-gray-500">{o.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── 확인 대화상자 ───
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "확인",
  danger,
  onConfirm,
  onClose,
  children,
  pending,
}: {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
  pending?: boolean;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="alertdialog" aria-modal aria-label={title} className="member-pop w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-[color:var(--fg)]">{title}</h2>
          <button type="button" onClick={onClose} className="-m-1 rounded-full p-1 text-gray-400 hover:bg-gray-100" aria-label="닫기">
            <X className="size-5" />
          </button>
        </div>
        {body && <div className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">{body}</div>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className={btnClass("secondary")}>
            닫기
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className={btnClass(danger ? "primary" : "primary")}>
            {pending ? "처리 중…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── 서버 액션 실행 + 결과 문구 ───
export type MemberActionResult = { ok: true; message?: string } | { ok: false; error: string };

export function useMemberAction() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [result, setResult] = React.useState<MemberActionResult | null>(null);
  const run = React.useCallback(
    (fn: () => Promise<MemberActionResult>, opts?: { onSuccess?: () => void; refresh?: boolean }) => {
      start(async () => {
        const r = await fn();
        setResult(r);
        if (r.ok) {
          opts?.onSuccess?.();
          if (opts?.refresh !== false) router.refresh();
        }
      });
    },
    [router],
  );
  return { run, pending, result, clear: () => setResult(null) };
}

export function ActionMessage({ result }: { result: MemberActionResult | null }) {
  if (!result) return null;
  const text = result.ok ? result.message : result.error;
  if (!text) return null;
  return (
    <p role={result.ok ? "status" : "alert"} className={cn("rounded-xl px-4 py-3 text-sm font-medium", result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
      {text}
    </p>
  );
}
