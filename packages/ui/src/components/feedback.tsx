import * as React from "react";

import { cn } from "../lib/cn";

/** 비어 있음. 테두리 박스 없이 가운데 정렬 — 주변 레이아웃을 흐트러뜨리지 않는다 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  framed = false,
  className,
  children,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 행동 1개 (Button 또는 링크) */
  action?: React.ReactNode;
  size?: "sm" | "md";
  /** 옅은 회색 면으로 영역 표시 (목록 자리를 대신할 때) */
  framed?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        size === "sm" ? "px-4 py-10" : "px-6 py-16",
        framed && "rounded-xl bg-surface",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex items-center justify-center rounded-full bg-surface-sunken text-muted [&_svg]:size-5",
            size === "sm" ? "size-10" : "size-12",
            framed && "bg-canvas",
          )}
          aria-hidden
        >
          {icon}
        </div>
      )}
      <p className={cn("font-semibold text-ink", size === "sm" ? "text-body-sm" : "text-title")}>{title}</p>
      {description && (
        <p className={cn("mt-1.5 max-w-md text-muted", size === "sm" ? "text-caption" : "text-body-sm")}>{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton h-4 w-full", className)} {...props} />;
}

/**
 * 알림 띠 (페이지 상단 안내, 면책 고지, 오류 요약).
 * 왼쪽 아이콘 + 제목(선택) + 본문 + 행동(선택). 옅은 배경, 테두리 없음.
 */
const NOTICE_TONE = {
  neutral: "bg-surface text-ink-soft",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand-700",
} as const;

export function Notice({
  tone = "neutral",
  icon,
  title,
  children,
  action,
  className,
  role,
}: {
  tone?: keyof typeof NOTICE_TONE;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role}
      className={cn("flex flex-col gap-3 rounded-xl px-4 py-3.5 sm:flex-row sm:items-center", NOTICE_TONE[tone], className)}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-5" aria-hidden>{icon}</span>}
        <div className="min-w-0 text-body-sm">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={cn(title && "mt-0.5", "text-ink-soft")}>{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}
