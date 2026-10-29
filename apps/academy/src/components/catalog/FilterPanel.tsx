"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
    <div className={`transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">필터</p>
        {hasAny && (
          <button
            type="button"
            onClick={() =>
              startTransition(() => router.push(catalogHref(locale, { q: query.q, sort: query.sort }), { scroll: false }))
            }
            className="text-xs font-medium text-muted hover:text-ink"
          >
            초기화
          </button>
        )}
      </div>
      {groups.map((g) => (
        <fieldset key={g.key} className="mt-5 border-t border-line-soft pt-5">
          <legend className="sr-only">{g.title}</legend>
          <p aria-hidden className="mb-3 text-[13px] font-semibold text-ink-soft">
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
                  className={`flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm ${
                    empty ? "cursor-not-allowed text-subtle" : "cursor-pointer text-ink-soft hover:text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={empty}
                    onChange={() => toggle(g.key, o.value)}
                    className="h-4 w-4 rounded border-line accent-[#e31b34]"
                  />
                  <span className="flex-1">{o.label}</span>
                  {typeof o.count === "number" && <span className="text-xs text-subtle">{o.count}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
