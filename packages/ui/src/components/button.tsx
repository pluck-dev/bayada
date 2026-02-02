import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        brand:
          "bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:bg-[color:var(--brand-hover)] active:scale-[0.98]",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary-hover)] active:scale-[0.98]",
        outline:
          "border border-[color:var(--border)] bg-transparent text-[color:var(--fg)] hover:bg-[color:var(--surface)]",
        ghost:
          "bg-transparent text-[color:var(--fg)] hover:bg-[color:var(--surface)]",
        link: "bg-transparent text-[color:var(--brand)] hover:underline",
        danger:
          "bg-[color:var(--error)] text-white hover:bg-red-700 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
