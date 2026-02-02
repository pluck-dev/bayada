import * as React from "react";

import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-[color:var(--surface-3)]",
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
