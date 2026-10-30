"use client";

import { useRouter } from "next/navigation";
import { selectClass } from "@bayada/ui";
import { catalogHref, type CatalogQuery } from "@/lib/catalog-url";

const OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "popular", label: "인기순" },
  { value: "newest", label: "최신순" },
];

export function SortSelect({ locale, query }: { locale: string; query: CatalogQuery }) {
  const router = useRouter();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">정렬</span>
      <select
        value={query.sort ?? "recommended"}
        onChange={(e) => router.push(catalogHref(locale, { ...query, sort: e.target.value, page: 1 }), { scroll: false })}
        className={selectClass("md", "h-10 w-auto text-body-sm font-medium")}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
