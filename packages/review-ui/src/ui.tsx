"use client";
// 리뷰 도구 전용 기본 컨트롤 — 원본 패키지의 Button·Input·Textarea·Checkbox·DropdownSelect 를 한 파일로 옮겼다.
// 모양은 review.css 의 .ui-* / .fn-* 규칙이 담당하고, 사이트 CSS 와 겹치지 않는 클래스 이름만 쓴다.
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "@untitledui/icons";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "unstyled";
  size?: "s" | "m" | "l";
  shape?: "rounded" | "full";
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({ variant = "secondary", size, shape = "rounded", leadingIcon, trailingIcon, children, className = "", type = "button", ...props }: ButtonProps) {
  if (variant === "unstyled") return <button data-component="Button" {...props} type={type} className={className}>{leadingIcon}{children}{trailingIcon}</button>;
  return <button data-component="Button" {...props} type={type} data-size={size} data-shape={shape} className={`ui-button ui-button-${variant} ${size ? "fn-button" : ""} ${className}`}>
    {leadingIcon}{size ? <span className="fn-button-label">{children}</span> : children}{trailingIcon}
  </button>;
}

type FieldAppearance = { appearance?: "default" | "unstyled" };
export function Input({ appearance = "default", className = "", type = "text", ...props }: ComponentProps<"input"> & FieldAppearance) {
  const choice = type === "checkbox" || type === "radio";
  const styled = appearance === "default" && type !== "hidden";
  return <input data-component={choice ? (type === "checkbox" ? "Checkbox" : "Radio") : "Input"} {...props} type={type} className={`${styled ? choice ? "ui-choice" : "ui-input" : ""} ${className}`.trim()} />;
}

export function Textarea({ appearance = "default", className = "", ...props }: ComponentProps<"textarea"> & FieldAppearance) {
  return <textarea data-component="Textarea" {...props} className={`${appearance === "default" ? "ui-input ui-textarea" : ""} ${className}`.trim()} />;
}

export function Checkbox({ children, className = "", ...props }: Omit<ComponentProps<"input">, "type"> & { children: ReactNode }) {
  return <label className={`ui-checkbox-field type-label-3 ${className}`} data-component="Checkbox">
    <Input {...props} type="checkbox" appearance="unstyled" className="ui-checkbox-input" />
    <span className="ui-checkbox-box" aria-hidden="true"><Check size={16} strokeWidth={1.5} /></span>
    <span>{children}</span>
  </label>;
}

type Option = { value: string; label: string };
// `placeholder` 는 선택 전까지 값을 비워 둔다. `layer="inspector"` 는 메뉴를 사이드바 위로 올리고 검사 대상에서 뺀다.
export function DropdownSelect({ options, name, value, defaultValue, onValueChange, required, disabled, label, placeholder, className = "", layer }: {
  options: readonly Option[]; name?: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; required?: boolean; disabled?: boolean; label: string;
  placeholder?: string; className?: string; layer?: "inspector";
}) {
  const initial = defaultValue ?? (placeholder === undefined ? options[0]?.value ?? "" : "");
  const [internal, setInternal] = useState(initial);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = value ?? internal;
  const hasEmpty = options.some(option => option.value === "");
  useEffect(() => {
    const form = trigger.current?.form;
    const reset = () => setInternal(initial);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initial]);
  return <Select.Root name={name} required={required} disabled={disabled} value={selected === "" && hasEmpty ? "__direct__" : selected} onValueChange={next => {
    const normalized = next === "__direct__" ? "" : next;
    setInternal(normalized);
    onValueChange?.(normalized);
  }}>
    <Select.Trigger ref={trigger} aria-label={label} className={`ui-input ui-select-trigger ${className}`.trim()} data-component="Select">
      <Select.Value placeholder={placeholder} /><Select.Icon><ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" align="start" sideOffset={4} collisionPadding={16} className={`foundation-theme ui-select-menu${layer ? " ui-select-menu-inspector" : ""}`} data-element-inspector={layer ? "" : undefined}>
        <Select.Viewport>{options.map(option => <Select.Item key={option.value} value={option.value || "__direct__"} className="ui-select-option">
          <Select.ItemText>{option.label}</Select.ItemText>
          <Select.ItemIndicator><Check size={18} strokeWidth={1.5} aria-hidden="true" /></Select.ItemIndicator>
        </Select.Item>)}</Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
