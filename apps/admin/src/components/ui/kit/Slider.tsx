"use client";

import { useRef } from "react";
import { cn } from "@bayada/ui";

/** 네이티브 <input type="range"> 대체. 포인터 드래그 + 키보드(←→ step, PageUp/Down 10%, Home/End) */
export function Slider({
  min = 0,
  max,
  step = 1,
  value,
  onChange,
  name,
  format,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  min?: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  name?: string;
  format?: (v: number) => string;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const span = Math.max(max - min, 1);
  const pct = ((Math.min(Math.max(value, min), max) - min) / span) * 100;
  const snap = (v: number) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));
  const fromPointer = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    onChange(snap(min + ((x - r.left) / r.width) * span));
  };
  return (
    <div className={cn("relative py-3", disabled && "pointer-events-none opacity-40", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <div
        ref={track}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => e.buttons === 1 && fromPointer(e.clientX)}
        className="relative h-1.5 cursor-pointer touch-none rounded-full bg-wash-strong"
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format?.(value)}
          onKeyDown={(e) => {
            const big = Math.max(step, Math.round(span / 10 / step) * step);
            const m: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big };
            if (e.key in m) {
              e.preventDefault();
              onChange(snap(value + m[e.key]));
            } else if (e.key === "Home") {
              e.preventDefault();
              onChange(min);
            } else if (e.key === "End") {
              e.preventDefault();
              onChange(max);
            }
          }}
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas shadow-[0_0_0_2px_var(--color-brand),0_3px_8px_rgb(0_0_0/0.18)] outline-none transition-transform hover:scale-110 focus-visible:scale-110 active:scale-110"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
