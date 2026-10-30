import * as React from "react";

import { cn } from "../lib/cn";
import type { LinkLike } from "./link";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "size-7 text-micro" : size === "lg" ? "size-12 text-body" : "size-9 text-caption";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-white",
        dim,
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{name.trim().charAt(0).toUpperCase() || "?"}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

/** 진도·비율. 100% 는 success 색. label 이 있으면 위에 라벨/값 한 줄 */
export function ProgressBar({
  value,
  label,
  showValue = false,
  size = "md",
  tone,
  className,
}: {
  value: number;
  label?: React.ReactNode;
  showValue?: boolean;
  size?: "sm" | "md";
  tone?: "brand" | "success" | "neutral";
  className?: string;
}) {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  const color = (tone ?? (v >= 100 ? "success" : "brand")) === "success" ? "bg-success" : tone === "neutral" ? "bg-ink" : "bg-brand";
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-caption">
          <span className="text-muted">{label}</span>
          {showValue && <span className="tabular font-semibold text-ink">{v}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === "string" ? label : "진도율"}
        className={cn("overflow-hidden rounded-full bg-surface-sunken", size === "sm" ? "h-1.5" : "h-2")}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", color)} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** 숫자 요약 타일. 테두리 대신 옅은 면(surface) — 여러 개가 나란히 있을 때 선이 겹치지 않게 */
export function StatCard({
  label,
  value,
  unit,
  hint,
  href,
  LinkComponent = "a",
  size = "md",
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  LinkComponent?: LinkLike;
  size?: "sm" | "md";
  className?: string;
}) {
  const body = (
    <>
      <p className={cn("text-muted", size === "sm" ? "text-micro font-medium" : "text-caption font-medium")}>{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className={cn("tabular font-bold tracking-tight text-ink", size === "sm" ? "text-[22px] leading-tight" : "text-h2")}>
          {value}
        </span>
        {unit && <span className="text-body-sm font-semibold text-ink-soft">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-caption text-muted">{hint}</p>}
    </>
  );
  const cls = cn("block rounded-xl bg-surface", size === "sm" ? "px-4 py-3" : "px-5 py-4", className);
  if (href) {
    const L = LinkComponent;
    return (
      <L href={href} className={cn(cls, "transition-colors hover:bg-surface-sunken")}>
        {body}
      </L>
    );
  }
  return <div className={cls}>{body}</div>;
}
