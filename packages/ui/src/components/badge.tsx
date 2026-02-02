import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--brand-bg)] text-[color:var(--brand)]",
        success:
          "bg-[color:var(--success-bg)] text-[color:var(--success)]",
        warning:
          "bg-[color:var(--warning-bg)] text-[color:var(--warning)]",
        error:
          "bg-[color:var(--error-bg)] text-[color:var(--error)]",
        info:
          "bg-[color:var(--info-bg)] text-[color:var(--info)]",
        secondary:
          "bg-[color:var(--surface-3)] text-[color:var(--muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
