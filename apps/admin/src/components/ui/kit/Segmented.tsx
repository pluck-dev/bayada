"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@bayada/ui";

type Opt<T extends string> = { value: T; label: React.ReactNode; icon?: React.ReactNode; href?: string };

/**
 * 2~4개 중 택1 알약 토글 (네이티브 radio 대체). 트랙 위로 활성 알약이 미끄러진다.
 * tone: light = wash 트랙 + 잉크 알약 / dark = 사이드바용(어두운 트랙 + 레드 알약).
 * option.href 가 있으면 링크로 동작(작업 영역 전환처럼 URL 이 상태인 경우).
 * role=radiogroup, ←→ 로 이동·선택. name 을 주면 숨은 input 으로 폼 제출.
 */
export function Segmented<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  name,
  size = "md",
  tone = "light",
  fullWidth,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  options: Opt<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
  name?: string;
  size?: "md" | "sm" | "lg";
  tone?: "light" | "dark";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}) {
  const [inner, setInner] = useState<T>(defaultValue ?? options[0].value);
  const current = value ?? inner;
  const refs = useRef<(HTMLElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const idx = Math.max(0, options.findIndex((o) => o.value === current));

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[idx];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, [idx, options.length]);

  const select = (v: T) => {
    if (disabled) return;
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  const dark = tone === "dark";
  const h = size === "lg" ? "h-12" : size === "md" ? "h-10" : "h-8";
  const text = size === "lg" ? "text-[14px]" : size === "md" ? "text-[13.5px]" : "text-[12.5px]";

  return (
    <div
      ref={track}
      role={options.some((o) => o.href) ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative inline-flex shrink-0 rounded-full p-1",
        h,
        dark ? "bg-side-raised" : "bg-wash",
        fullWidth && "flex w-full",
        disabled && "opacity-50",
        className,
      )}
    >
      {name && <input type="hidden" name={name} value={current} />}
      {pill && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 rounded-full transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            dark ? "bg-brand shadow-[0_4px_14px_-4px_rgb(227_27_52/0.6)]" : "bg-ink",
          )}
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {options.map((o, i) => {
        const on = o.value === current;
        const cls = cn(
          "relative z-[1] inline-flex items-center justify-center gap-1.5 rounded-full px-4 font-bold whitespace-nowrap outline-none transition-colors duration-200",
          "focus-visible:shadow-[0_0_0_2px_var(--color-ink)]",
          dark && "focus-visible:shadow-[0_0_0_2px_#fff]",
          fullWidth && "flex-1",
          text,
          on ? "text-white" : dark ? "text-side-fg hover:text-white" : "text-muted hover:text-ink",
          "[&_svg]:size-4",
        );
        const content = (
          <>
            {o.icon}
            {o.label}
          </>
        );
        if (o.href) {
          return (
            <Link
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              href={o.href}
              aria-current={on ? "true" : undefined}
              onClick={() => select(o.value)}
              className={cls}
            >
              {content}
            </Link>
          );
        }
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onClick={() => select(o.value)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const n = (i + d + options.length) % options.length;
              select(options[n].value);
              refs.current[n]?.focus();
            }}
            className={cls}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
