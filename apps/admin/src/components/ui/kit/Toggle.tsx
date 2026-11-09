"use client";

import { useId, useState } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@bayada/ui";

type Base = {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  label?: React.ReactNode;
  desc?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** 폼 전송 값 (기본 "on"). 꺼져 있으면 아무것도 전송하지 않는다 — 네이티브 checkbox 와 같다 */
  value?: string;
};

function useChecked(p: Base) {
  const [inner, setInner] = useState(!!p.defaultChecked);
  const on = p.checked ?? inner;
  const toggle = () => {
    if (p.disabled) return;
    if (p.checked === undefined) setInner(!on);
    p.onChange?.(!on);
  };
  return [on, toggle] as const;
}

function Label({ label, desc, id }: { label?: React.ReactNode; desc?: React.ReactNode; id: string }) {
  if (!label && !desc) return null;
  return (
    <span className="min-w-0 text-left" id={id}>
      {label && <span className="block text-[13.5px] font-semibold leading-[1.4] text-ink">{label}</span>}
      {desc && <span className="mt-0.5 block text-[12px] leading-[1.45] text-muted">{desc}</span>}
    </span>
  );
}

/** 네이티브 checkbox 대체 — 레드 상자 + 흰 체크. indeterminate(일부 선택) 지원 */
export function Checkbox(p: Base & { indeterminate?: boolean; size?: "md" | "sm" }) {
  const [on, toggle] = useChecked(p);
  const uid = useId();
  const mixed = !on && p.indeterminate;
  const sm = p.size === "sm";
  return (
    <button
      type="button"
      role="checkbox"
      id={p.id}
      aria-checked={mixed ? "mixed" : on}
      aria-label={p["aria-label"]}
      aria-labelledby={!p["aria-label"] && (p.label || p.desc) ? uid : undefined}
      disabled={p.disabled}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={cn(
        "group inline-flex items-start gap-2.5 rounded-md text-left outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
        p.className,
      )}
    >
      {p.name && on && <input type="hidden" name={p.name} value={p.value ?? "on"} />}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-[background-color,box-shadow] duration-150",
          sm ? "mt-0 size-[18px] rounded-[6px]" : "mt-px size-5 rounded-[7px]",
          "group-focus-visible:shadow-[0_0_0_2px_var(--color-canvas),0_0_0_4px_var(--color-ink)]",
          on || mixed
            ? "bg-brand text-white group-hover:bg-brand-hover"
            : "bg-canvas shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] group-hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]",
        )}
      >
        {on && <Check className={cn("animate-check-in", sm ? "size-3" : "size-3.5")} strokeWidth={3.2} aria-hidden />}
        {mixed && <Minus className={cn("animate-check-in", sm ? "size-3" : "size-3.5")} strokeWidth={3.2} aria-hidden />}
      </span>
      <Label label={p.label} desc={p.desc} id={uid} />
    </button>
  );
}

/** 켜기/끄기 스위치 — 노출 여부·활성 같은 즉시 상태값 */
export function Switch(p: Base & { size?: "md" | "sm" }) {
  const [on, toggle] = useChecked(p);
  const uid = useId();
  const sm = p.size === "sm";
  return (
    <button
      type="button"
      role="switch"
      id={p.id}
      aria-checked={on}
      aria-label={p["aria-label"]}
      aria-labelledby={!p["aria-label"] && (p.label || p.desc) ? uid : undefined}
      disabled={p.disabled}
      onClick={toggle}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full text-left outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
        p.className,
      )}
    >
      {p.name && on && <input type="hidden" name={p.name} value={p.value ?? "on"} />}
      <span
        className={cn(
          "relative flex shrink-0 items-center rounded-full p-[3px] transition-colors duration-200",
          sm ? "h-5 w-9" : "h-6 w-11",
          "group-focus-visible:shadow-[0_0_0_2px_var(--color-canvas),0_0_0_4px_var(--color-ink)]",
          on ? "bg-brand group-hover:bg-brand-hover" : "bg-line-strong group-hover:bg-neutral-400",
        )}
      >
        <span
          className={cn(
            "rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            sm ? "size-[14px]" : "size-[18px]",
            on && (sm ? "translate-x-4" : "translate-x-5"),
          )}
        />
      </span>
      <Label label={p.label} desc={p.desc} id={uid} />
    </button>
  );
}

/** 네이티브 radio 대체 — 원 + 가운데 점. 묶음 안 선택은 호출 쪽 상태로 정한다(onChange(true)) */
export function Radio(p: Base & { size?: "md" | "sm" }) {
  const uid = useId();
  const on = !!p.checked;
  const sm = p.size === "sm";
  return (
    <button
      type="button"
      role="radio"
      id={p.id}
      aria-checked={on}
      aria-label={p["aria-label"]}
      aria-labelledby={!p["aria-label"] && (p.label || p.desc) ? uid : undefined}
      disabled={p.disabled}
      onClick={() => !p.disabled && !on && p.onChange?.(true)}
      className={cn(
        "group inline-flex items-start gap-2.5 rounded-full text-left outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
        p.className,
      )}
    >
      {p.name && on && <input type="hidden" name={p.name} value={p.value ?? "on"} />}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-150",
          sm ? "size-[18px]" : "mt-px size-5",
          "group-focus-visible:shadow-[0_0_0_2px_var(--color-canvas),0_0_0_4px_var(--color-ink)]",
          on
            ? "bg-brand group-hover:bg-brand-hover"
            : "bg-canvas shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] group-hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]",
        )}
      >
        {on && <span className={cn("animate-check-in rounded-full bg-white", sm ? "size-1.5" : "size-2")} />}
      </span>
      <Label label={p.label} desc={p.desc} id={uid} />
    </button>
  );
}
