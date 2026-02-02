"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button, Input } from "@bayada/ui";

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
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>

      {filters && (
        <div className="flex gap-2">
          <Button
            variant={currentFilter === "" ? "outline" : "ghost"}
            size="sm"
            onClick={() => updateParams({ [filterKey]: "" })}
          >
            전체
          </Button>
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={currentFilter === f.value ? "outline" : "ghost"}
              size="sm"
              onClick={() => updateParams({ [filterKey]: f.value })}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {secondFilters && secondFilterKey && (
        <div className="flex gap-2">
          {secondFilters.map((f) => (
            <Button
              key={f.value}
              variant={currentSecondFilter === f.value ? "outline" : "ghost"}
              size="sm"
              onClick={() =>
                updateParams({
                  [secondFilterKey]:
                    currentSecondFilter === f.value ? "" : f.value,
                })
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
