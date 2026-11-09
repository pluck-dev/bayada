"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@bayada/ui";
import { Popover } from "./popover";
import { optionClass, triggerClass, type FieldSize } from "./styles";
import { FormValue } from "./FormValue";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  /** 글자 입력 이동용 문자열 (label 이 문자열이 아닐 때) */
  text?: string;
  /** 묶음 제목 (optgroup 대체) — 같은 group 끼리 연속으로 둔다 */
  group?: string;
};

/**
 * 네이티브 <select> 대체. 키보드(↑↓ Home End Enter Space Esc, 글자 입력 이동)·스크린리더(listbox) 지원.
 * name 을 주면 폼으로 값이 실려 간다(서버 액션 FormData·GET 폼 그대로). required 도 지원(커스텀 검증 말풍선).
 */
export function Select({
  name,
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "선택",
  size = "md",
  className,
  disabled,
  invalid,
  required,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: FieldSize;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const v = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const uid = useId();
  const triggerId = id ?? `${uid}-trigger`;
  const sel = useMemo(() => options.find((o) => o.value === v), [options, v]);

  const choose = (o: SelectOption) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === v)));
    requestAnimationFrame(() => list.current?.focus());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const move = (d: number) => {
    let i = active;
    for (let k = 0; k < options.length; k++) {
      i = (i + d + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
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

  return (
    <div className={cn("relative", size === "sm" ? "w-auto" : "w-full", className)}>
      <FormValue name={name} value={v} required={required} proxyFor={triggerId} />
      <button
        ref={btn}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClass(size, open, invalid)}
      >
        <span className={cn("min-w-0 truncate", !sel && "text-subtle")}>{sel ? sel.label : placeholder}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180 text-ink")}
          aria-hidden
        />
      </button>

      <Popover anchor={btn.current} open={open} onClose={() => setOpen(false)} minWidth={size === "sm" ? 200 : 180}>
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
            const head = o.group && o.group !== options[i - 1]?.group;
            return [
              head && (
                <li key={`g-${o.group}`} role="presentation" className="px-3 pb-1 pt-2.5 text-[11px] font-bold tracking-[0.02em] text-subtle first:pt-1">
                  {o.group}
                </li>
              ),
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
                  {o.hint && <span className="block truncate text-[12px] font-normal text-muted">{o.hint}</span>}
                </span>
                {on && (
                  <span className="flex size-5 shrink-0 animate-check-in items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </li>,
            ];
          })}
        </ul>
      </Popover>
    </div>
  );
}
