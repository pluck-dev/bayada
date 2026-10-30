import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

/**
 * 버튼 위계 (화면당 primary 는 최대 1개)
 * - primary   : 브랜드 레드. 그 화면의 단 하나의 주요 행동
 * - secondary : 흰 바탕 + 테두리. 나머지 모든 일반 행동
 * - ghost     : 배경 없음. 툴바·보조 링크성 행동
 * - danger    : 되돌릴 수 없는 행동(삭제·취소·반려). 흰 바탕 + 진홍 글자
 * - link      : 문장 안 링크처럼 보이는 행동
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-700",
        secondary: "border border-line-strong bg-canvas text-ink hover:border-neutral-400 hover:bg-surface",
        ghost: "text-ink-soft hover:bg-surface-sunken hover:text-ink",
        danger: "border border-danger-line bg-canvas text-danger hover:bg-danger-soft",
        link: "h-auto! px-0! text-ink underline-offset-4 hover:text-brand hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-micro rounded-md",
        sm: "h-8 px-3 text-caption rounded-md",
        md: "h-10 px-4 text-body-sm",
        lg: "h-12 px-6 text-body",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      fullWidth: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  ),
);
Button.displayName = "Button";

const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost: "text-ink-soft hover:bg-surface-sunken hover:text-ink",
        secondary: "border border-line-strong bg-canvas text-ink hover:bg-surface",
        overlay: "bg-canvas/90 text-ink shadow-xs ring-1 ring-black/5 backdrop-blur hover:bg-canvas",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  /** 아이콘만 있으므로 접근성 이름 필수 */
  label: string;
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, icon, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {icon}
    </button>
  ),
);
IconButton.displayName = "IconButton";

export { iconButtonVariants };
