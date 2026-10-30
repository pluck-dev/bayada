"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@bayada/ui";
import { catalogHref, type CatalogQuery, type ListKey } from "@/lib/catalog-url";

export interface FilterGroup {
  key: ListKey;
  title: string;
  options: { value: string; label: string; count?: number }[];
}

export function FilterPanel({
  locale,
  query,
  groups,
}: {
  locale: string;
  query: CatalogQuery;
  groups: FilterGroup[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(key: ListKey, value: string) {
    const current = query[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    startTransition(() => {
      router.push(catalogHref(locale, { ...query, [key]: next, page: 1 }), { scroll: false });
    });
  }

  const hasAny = groups.some((g) => (query[g.key] ?? []).length > 0);

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <div className="flex items-center justify-between">
        <p className="text-body font-semibold text-ink">필터</p>
        {hasAny && (
          <button
            type="button"
            onClick={() =>
              startTransition(() => router.push(catalogHref(locale, { q: query.q, sort: query.sort }), { scroll: false }))
            }
            className="text-caption font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            초기화
          </button>
        )}
      </div>
      {groups.map((g) => (
        <fieldset key={g.key} className="mt-6">
          <legend className="sr-only">{g.title}</legend>
          <p aria-hidden className="mb-2 text-body-sm font-semibold text-ink">
            {g.title}
          </p>
          <div className="space-y-1">
            {g.options.map((o) => {
              const checked = (query[g.key] ?? []).includes(o.value);
              // 해당 강의가 없는 옵션은 보여 주되 고를 수 없게 (선택돼 있으면 해제는 가능)
              const empty = o.count === 0 && !checked;
              return (
                <label
                  key={o.value}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md py-1.5 text-body-sm",
                    empty ? "cursor-not-allowed text-disabled" : "cursor-pointer text-ink-soft hover:text-ink",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={empty}
                    onChange={() => toggle(g.key, o.value)}
                    className="h-4 w-4 rounded-xs border-line-strong accent-ink"
                  />
                  <span className="flex-1">{o.label}</span>
                  {typeof o.count === "number" && <span className="tabular text-caption text-subtle">{o.count}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
