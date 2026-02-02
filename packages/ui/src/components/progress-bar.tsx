import * as React from "react";

import { cn } from "../lib/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, label, showPercent = true, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        {(label || showPercent) && (
          <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
            {label && <span>{label}</span>}
            {showPercent && <span>{Math.round(clampedValue)}%</span>}
          </div>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--surface-3)]">
          <div
            className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-300"
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
