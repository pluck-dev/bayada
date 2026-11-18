"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { Field, type ControlSize } from "./form";
import { HiddenValue, Popover } from "./popover";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  /** 글자 입력 이동용 문자열 (label 이 문자열이 아닐 때) */
  text?: string;
};

/** 열린 목록 트리거 공통 모양 (Select·DatePicker) */
export function triggerClass(size: ControlSize | "pill", open: boolean, invalid?: boolean) {
  return cn(
    "group flex w-full items-center justify-between gap-2 border bg-canvas text-left text-ink outline-none transition-[border-color,box-shadow,background-color]",
    size === "pill"
      ? "h-10 rounded-full border-transparent bg-surface-sunken pl-4 pr-3 text-body-sm font-semibold hover:bg-neutral-200"
      : size === "sm"
        ? "h-8 rounded-md border-line-strong px-2.5 text-caption hover:border-neutral-400"
        : "h-11 rounded-xl border-line-strong px-3.5 text-body hover:border-neutral-400",
    open && (size === "pill" ? "bg-neutral-200" : "border-ink ring-3 ring-neutral-200"),
    invalid && "border-danger",
    "focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-neutral-200",
    "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted",
  );
}

export function optionClass(active: boolean, selected: boolean, disabled?: boolean) {
  return cn(
    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-colors",
    active && "bg-surface-sunken",
    selected ? "font-semibold text-ink" : "text-ink-soft",
    disabled && "cursor-not-allowed opacity-40",
  );
}

/** <option> 자식(옛 사용법)도 받아서 options 로 바꾼다 */
function optionsFromChildren(children: React.ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== "option") return;
    const p = child.props as { value?: string; children?: React.ReactNode; disabled?: boolean };
    out.push({ value: String(p.value ?? ""), label: p.children, disabled: p.disabled, text: typeof p.children === "string" ? p.children : undefined });
  });
  return out;
}

export interface SelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  options?: SelectOption[];
  /** 옛 사용법: <option> 자식 */
  children?: React.ReactNode;
  placeholder?: string;
  size?: ControlSize | "pill";
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  fieldClassName?: string;
  "aria-label"?: string;
  /** 목록 패널 정렬 (오른쪽 끝에 놓인 정렬 선택 등) */
  align?: "start" | "end";
}

/**
 * 네이티브 <select> 대체 — 디자인된 목록(listbox). 키보드 ↑↓ Home End Enter Space Esc·글자 입력 이동.
 * name 을 주면 숨은 입력으로 폼에 실린다(서버 액션 FormData·GET 폼 그대로). required 지원.
 * 값이 빈 문자열이고 disabled 인 옵션은 placeholder 로 쓴다(옛 사용법 호환).
 */
export function Select({
  name,
  value,
  defaultValue,
  onValueChange,
  options: optionsProp,
  children,
  placeholder,
  size = "md",
  className,
  disabled,
  required,
  id,
  label,
  help,
  error,
  fieldClassName,
  "aria-label": ariaLabel,
  align = "start",
}: SelectProps) {
  const all = optionsProp ?? optionsFromChildren(children);
  // 빈 값 + disabled 옵션은 목록에서 빼고 안내 문구로
  const placeholderOpt = all.find((o) => o.value === "" && o.disabled);
  const options = all.filter((o) => o !== placeholderOpt);
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const v = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const btn = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const typed = React.useRef({ s: "", t: 0 });
  const uid = React.useId();
  const triggerId = id ?? `${uid}-trigger`;
  const sel = options.find((o) => o.value === v);
  const shownPlaceholder = placeholder ?? (placeholderOpt?.label as React.ReactNode) ?? "선택";

  const choose = (o: SelectOption) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    onValueChange?.(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === v)));
    requestAnimationFrame(() => list.current?.focus());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const move = (d: number) => {
    let i = active;
    for (let k = 0; k < options.length; k++) {
      i = (i + d + options.length) % options.length;
      const option = options[i];
      if (option && !option.disabled) {
        setActive(i);
        return;
      }
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : "") + e.key.toLowerCase(), t: now };
      const i = options.findIndex((o) => (o.text ?? String(o.label)).toLowerCase().startsWith(typed.current.s));
      if (i >= 0) setActive(i);
    }
  };

  const control = (
    <div className={cn("relative", size === "pill" ? "w-auto" : "w-full", !label && !help && !error && className)}>
      <HiddenValue name={name} value={v} required={required} />
      <button
        ref={btn}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClass(size, open, !!error)}
      >
        <span className={cn("min-w-0 truncate", !sel && "text-subtle")}>{sel ? sel.label : shownPlaceholder}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
          className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180 text-ink")}
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
      </button>

      <Popover anchor={btn.current} open={open} onClose={() => setOpen(false)} minWidth={size === "pill" ? 168 : 180} align={align}>
        <ul
          ref={list}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${uid}-${active}`}
          onKeyDown={onListKey}
          className="max-h-[300px] overflow-y-auto outline-none"
        >
          {options.map((o, i) => {
            const on = o.value === v;
            return (
              <li
                key={o.value || `__empty${i}`}
                id={`${uid}-${i}`}
                data-i={i}
                role="option"
                aria-selected={on}
                aria-disabled={o.disabled || undefined}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o)}
                className={optionClass(i === active, on, o.disabled)}
              >
                <span className="min-w-0">
                  <span className="block truncate">{o.label}</span>
                  {o.hint && <span className="block truncate text-caption font-normal text-muted">{o.hint}</span>}
                </span>
                {on && (
                  <span className="flex size-5 shrink-0 animate-check-in items-center justify-center rounded-full bg-brand text-white">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden>
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );

  if (!label && !help && !error) return control;
  return (
    <Field label={label} help={help} error={error} required={required} htmlFor={triggerId} className={cn(fieldClassName, className)}>
      {control}
    </Field>
  );
}
