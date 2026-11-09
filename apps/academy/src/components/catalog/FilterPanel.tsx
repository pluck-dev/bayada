"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, CheckVisual, Sheet, cn } from "@bayada/ui";
import { catalogHref, type CatalogQuery, type ListKey } from "@/lib/catalog-url";

export interface FilterGroup {
  key: ListKey;
  title: string;
  options: { value: string; label: string; count?: number }[];
}

function useFilterNav(locale: string, query: CatalogQuery) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (q: CatalogQuery) => startTransition(() => router.push(catalogHref(locale, q), { scroll: false }));
  const toggle = (key: ListKey, value: string) => {
    const current = query[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    go({ ...query, [key]: next, page: 1 });
  };
  const reset = () => go({ q: query.q, sort: query.sort });
  return { pending, toggle, reset };
}

function selectedCount(query: CatalogQuery, groups: FilterGroup[]) {
  return groups.reduce((n, g) => n + (query[g.key]?.length ?? 0), 0);
}

/** 필터 목록 (데스크톱 사이드바·모바일 시트 공용). 고르면 바로 주소가 바뀌고 목록이 다시 그려진다 */
function FilterList({
  query,
  groups,
  toggle,
}: {
  query: CatalogQuery;
  groups: FilterGroup[];
  toggle: (key: ListKey, value: string) => void;
}) {
  return (
    <div className="divide-y divide-line-soft">
      {groups.map((g) => (
        <fieldset key={g.key} className="py-5 first:pt-0">
          <legend className="sr-only">{g.title}</legend>
          <p aria-hidden className="mb-2 text-body-sm font-bold text-ink">
            {g.title}
          </p>
          <div className="-mx-2 flex flex-col">
            {g.options.map((o) => {
              const checked = (query[g.key] ?? []).includes(o.value);
              // 해당 강의가 없는 옵션은 보여 주되 고를 수 없게 (선택돼 있으면 해제는 가능)
              const empty = o.count === 0 && !checked;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={empty}
                  onClick={() => toggle(g.key, o.value)}
                  className={cn(
                    "group/choice flex min-h-10 items-center gap-2.5 rounded-xl px-2 text-left text-body-sm transition-colors",
                    empty ? "cursor-not-allowed text-disabled" : "text-ink-soft hover:bg-surface-sunken hover:text-ink",
                    checked && "font-semibold text-ink",
                  )}
                >
                  <span className={cn(empty && "opacity-50")}>
                    <CheckVisual checked={checked} size="sm" />
                  </span>
                  <span className="flex-1">{o.label}</span>
                  {typeof o.count === "number" && <span className="tabular text-caption text-subtle">{o.count}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function FilterPanel({ locale, query, groups }: { locale: string; query: CatalogQuery; groups: FilterGroup[] }) {
  const { pending, toggle, reset } = useFilterNav(locale, query);
  const count = selectedCount(query, groups);
  return (
    <div className={cn("transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 text-body font-bold text-ink">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> 필터
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-2.5 py-1 text-caption font-semibold text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            초기화
          </button>
        )}
      </div>
      <FilterList query={query} groups={groups} toggle={toggle} />
    </div>
  );
}

/** 모바일: "필터" 알약 → 바텀시트 */
export function FilterSheetButton({
  locale,
  query,
  groups,
  total,
}: {
  locale: string;
  query: CatalogQuery;
  groups: FilterGroup[];
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const { pending, toggle, reset } = useFilterNav(locale, query);
  const count = selectedCount(query, groups);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-body-sm font-semibold transition-colors",
          count > 0 ? "bg-ink text-white" : "bg-surface-sunken text-ink hover:bg-neutral-200",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        필터
        {count > 0 && <span className="tabular rounded-full bg-white/20 px-1.5 text-caption">{count}</span>}
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="필터"
        footer={
          <>
            <Button onClick={reset} disabled={count === 0 || pending} size="lg" className="shrink-0">
              초기화
            </Button>
            <Button variant="primary" size="lg" fullWidth loading={pending} onClick={() => setOpen(false)}>
              {total.toLocaleString()}개 프로그램 보기
            </Button>
          </>
        }
      >
        <div className={cn("pt-2 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
          <FilterList query={query} groups={groups} toggle={toggle} />
        </div>
      </Sheet>
    </>
  );
}
