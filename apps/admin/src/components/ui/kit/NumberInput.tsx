"use client";

import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@bayada/ui";
import { fieldClass, type FieldSize } from "./styles";

/**
 * 숫자 입력 — 브라우저 스피너(globals.css 에서 숨김) 대신 −/+ 버튼. 입력 이벤트·min/max/step·name 은 네이티브와 같아
 * value/onChange(e) 형태 그대로 바꿔 끼울 수 있다. 버튼은 stepUp/stepDown 후 input 이벤트를 보내 React 상태도 갱신된다.
 */
export function NumberInput({
  className,
  size = "md",
  unit,
  stepper = true,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  size?: FieldSize;
  /** 오른쪽 단위 표시 (원·분·%) */
  unit?: React.ReactNode;
  stepper?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const bump = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el || el.disabled || el.readOnly) return;
    if (el.value === "") {
      // React 값 추적기를 거치지 않는 원래 setter 로 넣어야 onChange 가 불린다
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, String(props.min ?? 0));
    } else if (dir === 1) el.stepUp();
    else el.stepDown();
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const btn =
    "flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className={cn("group relative flex items-center", className)}>
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        {...props}
        className={cn(
          fieldClass(size),
          "num",
          stepper && (size === "md" ? "pr-[76px]" : "pr-[68px]"),
          unit && !stepper && "pr-10",
        )}
      />
      <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center gap-0.5">
        {unit && <span className="mr-1 text-[13px] font-semibold text-muted">{unit}</span>}
        {stepper && (
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-label="1 줄이기"
              disabled={props.disabled}
              onClick={() => bump(-1)}
              className={cn(btn, "pointer-events-auto")}
            >
              <Minus className="size-3.5" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="1 늘리기"
              disabled={props.disabled}
              onClick={() => bump(1)}
              className={cn(btn, "pointer-events-auto")}
            >
              <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
