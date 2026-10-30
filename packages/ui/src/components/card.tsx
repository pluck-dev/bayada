import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * 카드 = "한 덩어리의 정보". 섹션을 감싸는 용도로 남발하지 않는다
 * (섹션 구분은 여백과 SectionHeader 로).
 * - outline : 흰 바탕 + 1px 선 (기본)
 * - surface : 옅은 회색 바탕, 선 없음 (보조 정보 묶음)
 * - plain   : 선·배경 없음 (목록 안 항목)
 */
export const cardVariants = cva("relative flex flex-col overflow-hidden rounded-xl", {
  variants: {
    variant: {
      outline: "border border-line bg-canvas",
      surface: "bg-surface",
      plain: "",
    },
    interactive: {
      true: "transition-colors hover:border-line-strong focus-within:border-line-strong",
      false: "",
    },
  },
  defaultVariants: { variant: "outline", interactive: false },
});

export interface CardProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  as?: "div" | "section" | "article" | "li" | "aside";
}

export function Card({ className, variant, interactive, as: Tag = "div", ...props }: CardProps) {
  const El = Tag as "div";
  return <El className={cn(cardVariants({ variant, interactive }), className)} {...(props as React.HTMLAttributes<HTMLDivElement>)} />;
}

/** 카드 상단 이미지 영역 (기본 16:9) */
export function CardMedia({
  className,
  ratio = "video",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ratio?: "video" | "square" | "wide" }) {
  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-surface-sunken",
        ratio === "video" ? "aspect-video" : ratio === "square" ? "aspect-square" : "aspect-[21/9]",
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** 머리글 아래 구분선 (표·목록을 담을 때) */
  divider?: boolean;
  size?: "sm" | "md";
}

export function CardHeader({ className, title, description, actions, divider, size = "md", children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        size === "sm" ? "px-4 pt-3" : "px-6 pt-5",
        divider && (size === "sm" ? "border-b border-line pb-3" : "border-b border-line pb-4"),
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {title && <CardTitle className={size === "sm" ? "text-body-sm font-semibold" : undefined}>{title}</CardTitle>}
        {description && <p className="mt-1 text-body-sm text-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-title text-ink", className)} {...props} />;
}

export function CardBody({ className, size = "md", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" }) {
  return <div className={cn("flex-1", size === "sm" ? "p-4" : "p-6", className)} {...props} />;
}
/** 옛 이름 */
export const CardContent = CardBody;

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 border-t border-line px-6 py-4", className)} {...props} />;
}
