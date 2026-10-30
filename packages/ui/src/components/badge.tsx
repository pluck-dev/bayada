import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * 상태·분류 표시. 색은 의미에만 쓴다.
 * neutral = 분류/정보(유형, 직군) · brand = 강조 1개(신규, 추천) · success = 완료/유효/게시
 * warning = 대기/임박 · info = 진행 중 · danger = 반려/만료/취소
 */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "",
        brand: "",
        success: "",
        warning: "",
        info: "",
        danger: "",
        inverse: "",
      },
      variant: {
        soft: "",
        outline: "border bg-canvas",
      },
      size: {
        sm: "h-5 px-2 text-micro",
        md: "h-6 px-2.5 text-caption",
      },
    },
    compoundVariants: [
      { variant: "soft", tone: "neutral", className: "bg-surface-sunken text-ink-soft" },
      { variant: "soft", tone: "brand", className: "bg-brand-soft text-brand-700" },
      { variant: "soft", tone: "success", className: "bg-success-soft text-success" },
      { variant: "soft", tone: "warning", className: "bg-warning-soft text-warning" },
      { variant: "soft", tone: "info", className: "bg-info-soft text-info" },
      { variant: "soft", tone: "danger", className: "bg-danger-soft text-danger" },
      { variant: "soft", tone: "inverse", className: "bg-ink/80 text-white backdrop-blur" },
      { variant: "outline", tone: "neutral", className: "border-line-strong text-ink-soft" },
      { variant: "outline", tone: "brand", className: "border-brand-200 text-brand-700" },
      { variant: "outline", tone: "success", className: "border-success-line text-success" },
      { variant: "outline", tone: "warning", className: "border-warning-line text-warning" },
      { variant: "outline", tone: "info", className: "border-info-line text-info" },
      { variant: "outline", tone: "danger", className: "border-danger-line text-danger" },
      { variant: "outline", tone: "inverse", className: "border-white/30 bg-transparent text-white" },
    ],
    defaultVariants: { tone: "neutral", variant: "soft", size: "sm" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** 앞에 작은 점 (상태 표시용) */
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({ className, tone, variant, size, dot, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, variant, size }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {icon}
      {children}
    </span>
  );
}

/** 선택형 태그(필터 칩). 링크·버튼 어느 쪽에도 클래스로 붙인다 */
export function tagClass({ active = false, size = "md" }: { active?: boolean; size?: "sm" | "md" } = {}) {
  return cn(
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors",
    size === "sm" ? "h-7 px-3 text-caption" : "h-9 px-4 text-body-sm",
    active
      ? "border-ink bg-ink text-white"
      : "border-line bg-canvas text-ink-soft hover:border-line-strong hover:text-ink",
  );
}
