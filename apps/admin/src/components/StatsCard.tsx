import { Card, CardContent } from "@bayada/ui";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[color:var(--muted)]">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--fg)]">
              {value}
            </p>
            {trend && (
              <p
                className={`mt-1 text-xs font-medium ${
                  trend.isPositive
                    ? "text-[color:var(--success)]"
                    : "text-[color:var(--error)]"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% 전월 대비
              </p>
            )}
            {description && (
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                {description}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fae6ea]">
            <Icon className="h-6 w-6 text-[#ce0e2d]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
