"use client";

import { useRouter } from "next/navigation";
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
        className="h-10 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium text-ink hover:border-ink-soft focus:border-ink focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 h-4 w-4 text-muted"
        fill="currentColor"
      >
        <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </label>
  );
}
