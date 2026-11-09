"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import type { ControlSize } from "./form";

/* ── 체크박스 · 라디오 · 스위치 ──
 * 네이티브 입력은 화면에서 숨기고(sr-only, 폼·키보드·필수 검증은 그대로) 디자인된 모양을 그린다.
 * 라벨 전체가 클릭 영역. 상태: hover(테두리 진하게) · focus-visible(링) · checked(잉크/레드) · disabled(흐리게).
 */

interface ChoiceProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  help?: React.ReactNode;
  size?: ControlSize;
}

function ChoiceShell({
  label,
  help,
  size,
  className,
  input,
  visual,
  disabled,
}: {
  label?: React.ReactNode;
  help?: React.ReactNode;
  size: ControlSize;
  className?: string;
  input: React.ReactNode;
  visual: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "group/choice relative inline-flex items-start",
        size === "sm" ? "gap-2" : "gap-2.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      {input}
      <span className={cn("relative flex shrink-0", label ? (size === "sm" ? "mt-0.5" : "mt-[3px]") : "")}>{visual}</span>
      {label && (
        <span className="min-w-0">
          <span className={cn("text-ink", size === "sm" ? "text-caption" : "text-body-sm")}>{label}</span>
          {help && <span className="mt-0.5 block text-caption text-muted">{help}</span>}
        </span>
      )}
    </label>
  );
}

const hiddenInput = "peer sr-only";
const boxBase =
  "flex items-center justify-center border-[1.5px] border-neutral-400 bg-canvas text-white transition-[background-color,border-color,box-shadow] duration-150 group-hover/choice:border-neutral-500 peer-focus-visible:ring-3 peer-focus-visible:ring-brand-200";

/** 체크 표시 상자만 (목록 행 안에서 직접 그릴 때) */
export function CheckVisual({ checked, size = "md", tone = "ink" }: { checked: boolean; size?: ControlSize; tone?: "ink" | "brand" }) {
  return (
    <span
      aria-hidden
      className={cn(
        boxBase,
        "rounded-[6px]",
        size === "sm" ? "size-4" : "size-5",
        checked && (tone === "brand" ? "border-brand bg-brand" : "border-ink bg-ink"),
      )}
    >
      {checked && (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-[75%] animate-check-in">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      )}
    </span>
  );
}

/** 라디오 동그라미만 */
export function RadioVisual({ checked, size = "md" }: { checked: boolean; size?: ControlSize }) {
  return (
    <span aria-hidden className={cn(boxBase, "rounded-full", size === "sm" ? "size-4" : "size-5", checked && "border-ink")}>
      {checked && <span className={cn("animate-check-in rounded-full bg-ink", size === "sm" ? "size-2" : "size-2.5")} />}
    </span>
  );
}

function useChecked(props: { checked?: boolean; defaultChecked?: boolean; onChange?: React.ChangeEventHandler<HTMLInputElement> }) {
  const controlled = props.checked !== undefined;
  const [inner, setInner] = React.useState(!!props.defaultChecked);
  const checked = controlled ? !!props.checked : inner;
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!controlled) setInner(e.target.checked);
    props.onChange?.(e);
  };
  return { checked, onChange };
}

export const Checkbox = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", checked: c, defaultChecked, onChange: oc, disabled, ...props }, ref) => {
    const { checked, onChange } = useChecked({ checked: c, defaultChecked, onChange: oc });
    return (
      <ChoiceShell
        label={label}
        help={help}
        size={size}
        className={className}
        disabled={disabled}
        input={<input ref={ref} type="checkbox" className={hiddenInput} checked={checked} onChange={onChange} disabled={disabled} {...props} />}
        visual={<CheckVisual checked={checked} size={size} />}
      />
    );
  },
);
Checkbox.displayName = "Checkbox";

/**
 * 라디오: 같은 name 끼리 하나만 선택된다. 화면 상태는 브라우저 선택 상태를 따른다(비제어 그룹도 동작하도록
 * 선택 표시는 CSS peer-checked 로 그린다).
 */
export const Radio = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", disabled, ...props }, ref) => (
    <ChoiceShell
      label={label}
      help={help}
      size={size}
      className={className}
      disabled={disabled}
      input={<input ref={ref} type="radio" className={hiddenInput} disabled={disabled} {...props} />}
      visual={
        <span
          aria-hidden
          className={cn(
            boxBase,
            "rounded-full peer-checked:border-ink [&>span]:scale-0 peer-checked:[&>span]:scale-100",
            size === "sm" ? "size-4" : "size-5",
          )}
        >
          <span className={cn("rounded-full bg-ink transition-transform duration-150", size === "sm" ? "size-2" : "size-2.5")} />
        </span>
      }
    />
  ),
);
Radio.displayName = "Radio";

export const Switch = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", checked: c, defaultChecked, onChange: oc, disabled, ...props }, ref) => {
    const { checked, onChange } = useChecked({ checked: c, defaultChecked, onChange: oc });
    return (
      <ChoiceShell
        label={label}
        help={help}
        size={size}
        className={className}
        disabled={disabled}
        input={<input ref={ref} type="checkbox" role="switch" className={hiddenInput} checked={checked} onChange={onChange} disabled={disabled} {...props} />}
        visual={
          <span
            aria-hidden
            className={cn(
              "relative inline-flex shrink-0 rounded-full transition-colors duration-200 peer-focus-visible:ring-3 peer-focus-visible:ring-brand-200",
              size === "sm" ? "h-4 w-7" : "h-6 w-10",
              checked ? "bg-brand" : "bg-neutral-300 group-hover/choice:bg-neutral-400",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 rounded-full bg-white shadow-xs transition-transform duration-200",
                size === "sm" ? "size-3" : "size-5",
                checked && (size === "sm" ? "translate-x-3" : "translate-x-4"),
              )}
            />
          </span>
        }
      />
    );
  },
);
Switch.displayName = "Switch";
