import * as React from "react";

import { cn } from "../lib/cn";

/**
 * 폼 컨트롤: 라벨은 항상 위, 도움말은 아래(회색), 오류는 도움말 자리를 대신(진홍 + aria-invalid).
 * 크기: md(학습자 화면, 44px — 고령 사용자 터치 영역) / sm(어드민, 32px).
 */
export type ControlSize = "sm" | "md";

const controlBase =
  "w-full rounded-lg border border-line-strong bg-canvas text-ink placeholder:text-subtle transition-colors hover:border-neutral-400 focus:border-ink focus:outline-none focus:ring-3 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted aria-invalid:border-danger aria-invalid:focus:ring-danger-soft";

export function controlClass(size: ControlSize = "md", extra?: string) {
  return cn(controlBase, size === "sm" ? "h-8 rounded-md px-2.5 text-caption" : "h-11 px-3.5 text-body", extra);
}

export function textareaClass(size: ControlSize = "md", extra?: string) {
  return cn(
    controlBase,
    "min-h-24 leading-relaxed",
    size === "sm" ? "rounded-md px-2.5 py-2 text-caption" : "px-3.5 py-3 text-body",
    extra,
  );
}

export function selectClass(size: ControlSize = "md", extra?: string) {
  return cn(
    controlClass(size),
    "select-chevron",
    size === "sm" ? "pr-7" : "pr-10",
    extra,
  );
}

export interface FieldProps {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  size?: ControlSize;
  className?: string;
  children: React.ReactNode;
  /** 라벨 오른쪽 보조 요소 (예: 글자 수, '비밀번호 찾기') */
  aside?: React.ReactNode;
}

export function Field({ label, help, error, required, htmlFor, size = "md", className, children, aside }: FieldProps) {
  return (
    <div className={cn("flex flex-col", size === "sm" ? "gap-1.5" : "gap-2", className)}>
      {(label || aside) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label
              htmlFor={htmlFor}
              className={cn("font-semibold text-ink-soft", size === "sm" ? "text-caption" : "text-body-sm")}
            >
              {label}
              {required && (
                <span className="ml-0.5 text-brand" aria-hidden>
                  *
                </span>
              )}
            </label>
          )}
          {aside && <span className="text-caption text-muted">{aside}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : help ? (
        <p id={htmlFor ? `${htmlFor}-help` : undefined} className="text-caption text-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

type WithField = { label?: React.ReactNode; help?: React.ReactNode; error?: React.ReactNode; fieldClassName?: string };

function describedBy(id: string, error: unknown, help: unknown, own?: string) {
  return [own, error ? `${id}-error` : help ? `${id}-help` : null].filter(Boolean).join(" ") || undefined;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, WithField {
  size?: ControlSize;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", label, help, error, fieldClassName, id, required, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    const input = (
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, help, props["aria-describedby"])}
        className={controlClass(size, className)}
        {...props}
      />
    );
    if (!label && !help && !error) return input;
    return (
      <Field label={label} help={help} error={error} required={required} htmlFor={inputId} size={size} className={fieldClassName}>
        {input}
      </Field>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, WithField {
  size?: ControlSize;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "md", label, help, error, fieldClassName, id, required, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    const el = (
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, help, props["aria-describedby"])}
        className={textareaClass(size, className)}
        {...props}
      />
    );
    if (!label && !help && !error) return el;
    return (
      <Field label={label} help={help} error={error} required={required} htmlFor={inputId} size={size} className={fieldClassName}>
        {el}
      </Field>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">, WithField {
  size?: ControlSize;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "md", label, help, error, fieldClassName, id, required, options, placeholder, children, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    const el = (
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, help, props["aria-describedby"])}
        className={selectClass(size, className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    );
    if (!label && !help && !error) return el;
    return (
      <Field label={label} help={help} error={error} required={required} htmlFor={inputId} size={size} className={fieldClassName}>
        {el}
      </Field>
    );
  },
);
Select.displayName = "Select";

/* ── 체크박스 · 라디오 · 스위치 ── 라벨을 클릭 영역으로 포함한다 */

interface ChoiceProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  help?: React.ReactNode;
  size?: ControlSize;
}

const choiceBox =
  "peer shrink-0 cursor-pointer appearance-none border border-line-strong bg-canvas transition-colors checked:border-ink checked:bg-ink hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50";

function ChoiceLayout({
  control,
  label,
  help,
  size,
  className,
  htmlFor,
}: {
  control: React.ReactNode;
  label?: React.ReactNode;
  help?: React.ReactNode;
  size: ControlSize;
  className?: string;
  htmlFor: string;
}) {
  if (!label) return <>{control}</>;
  return (
    <div className={cn("flex items-start", size === "sm" ? "gap-2" : "gap-2.5", className)}>
      <span className={cn("relative flex", size === "sm" ? "mt-0.5" : "mt-[3px]")}>{control}</span>
      <span className="min-w-0">
        <label htmlFor={htmlFor} className={cn("cursor-pointer text-ink", size === "sm" ? "text-caption" : "text-body-sm")}>
          {label}
        </label>
        {help && <span className="mt-0.5 block text-caption text-muted">{help}</span>}
      </span>
    </div>
  );
}


export const Checkbox = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", id, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    return (
      <ChoiceLayout
        htmlFor={inputId}
        label={label}
        help={help}
        size={size}
        className={className}
        control={
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(choiceBox, "checkbox-mark rounded-xs", size === "sm" ? "size-4" : "size-5", !label && className)}
            {...props}
          />
        }
      />
    );
  },
);
Checkbox.displayName = "Checkbox";

export const Radio = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", id, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    return (
      <ChoiceLayout
        htmlFor={inputId}
        label={label}
        help={help}
        size={size}
        className={className}
        control={
          <input
            ref={ref}
            id={inputId}
            type="radio"
            className={cn(
              choiceBox,
              "rounded-full checked:bg-canvas checked:shadow-[inset_0_0_0_4px_var(--color-ink)]",
              size === "sm" ? "size-4" : "size-5",
              !label && className,
            )}
            {...props}
          />
        }
      />
    );
  },
);
Radio.displayName = "Radio";

export const Switch = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ className, label, help, size = "md", id, ...props }, ref) => {
    const auto = React.useId();
    const inputId = id ?? auto;
    return (
      <ChoiceLayout
        htmlFor={inputId}
        label={label}
        help={help}
        size={size}
        className={className}
        control={
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className={cn(
              "relative shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors checked:bg-ink disabled:cursor-not-allowed disabled:opacity-50",
              "before:absolute before:left-0.5 before:top-0.5 before:rounded-full before:bg-white before:shadow-xs before:transition-transform",
              size === "sm"
                ? "h-4 w-7 before:size-3 checked:before:translate-x-3"
                : "h-5 w-9 before:size-4 checked:before:translate-x-4",
              !label && className,
            )}
            {...props}
          />
        }
      />
    );
  },
);
Switch.displayName = "Switch";
