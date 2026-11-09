"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cx, inputSmClass } from "./ui";

const chip = (active: boolean) =>
  cx(
    "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors disabled:opacity-50",
    active ? "bg-ink text-white" : "bg-(--chip-bg) text-ink-soft hover:bg-(--chip-hover) hover:text-ink",
  );

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  filterKey?: string;
  filters?: FilterOption[];
  secondFilterKey?: string;
  secondFilters?: FilterOption[];
}

export function SearchFilter({
  searchPlaceholder = "검색...",
  filterKey = "status",
  filters,
  secondFilterKey,
  secondFilters,
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentFilter = searchParams.get(filterKey) ?? "";
  const currentSecondFilter = secondFilterKey
    ? searchParams.get(secondFilterKey) ?? ""
    : "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  // URL searchParams 동기화
  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // 필터 변경 시 페이지 초기화
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateParams({ search: searchValue });
  }, [searchValue, updateParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-[300px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
        <input
          type="search"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          className={cx(inputSmClass, "pl-10 font-medium")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>

      {filters && (
        <div className="flex flex-wrap gap-1.5">
          <button
              type="button"
              aria-pressed={currentFilter === ""}
              disabled={isPending}
              className={chip(currentFilter === "")}
              onClick={() => updateParams({ [filterKey]: "" })}
          >
            전체
          </button>
          {filters.map((f) => (
            <button
              type="button"
              key={f.value}
              aria-pressed={currentFilter === f.value}
              disabled={isPending}
              className={chip(currentFilter === f.value)}
              onClick={() => updateParams({ [filterKey]: f.value })}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {secondFilters && secondFilterKey && (
        <div className="flex flex-wrap gap-1.5">
          {secondFilters.map((f) => (
            <button
              type="button"
              key={f.value}
              aria-pressed={currentSecondFilter === f.value}
              disabled={isPending}
              className={chip(currentSecondFilter === f.value)}
              onClick={() =>
                updateParams({
                  [secondFilterKey]:
                    currentSecondFilter === f.value ? "" : f.value,
                })
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
