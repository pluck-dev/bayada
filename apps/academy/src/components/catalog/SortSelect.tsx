"use client";

import { useRouter } from "next/navigation";
import { Select } from "@bayada/ui";
import { catalogHref, type CatalogQuery } from "@/lib/catalog-url";

const OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "popular", label: "인기순" },
  { value: "newest", label: "최신순" },
];

export function SortSelect({ locale, query }: { locale: string; query: CatalogQuery }) {
  const router = useRouter();
  return (
    <Select
      aria-label="정렬"
      size="pill"
      align="end"
      value={query.sort ?? "recommended"}
      onValueChange={(sort) => router.push(catalogHref(locale, { ...query, sort, page: 1 }), { scroll: false })}
      options={OPTIONS}
    />
  );
}
