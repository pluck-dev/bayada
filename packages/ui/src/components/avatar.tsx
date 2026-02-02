import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-3)] text-[color:var(--muted)]",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const initials = fallback
      ? fallback.charAt(0).toUpperCase()
      : alt
        ? alt.charAt(0).toUpperCase()
        : "?";

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
