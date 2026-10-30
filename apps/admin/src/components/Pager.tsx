"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@bayada/ui";

/** 목록 하단: 총 건수 + 페이지 번호 (URL ?page=) */
export function Pager({ page, pages, total, unit = "건" }: { page: number; pages: number; total: number; unit?: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const href = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };
  return (
    <div className="mt-3 flex items-center justify-between gap-4">
      <span className="tabular text-caption text-muted">
        총 {total.toLocaleString()}
        {unit}
      </span>
      <Pagination page={page} totalPages={pages} hrefFor={href} LinkComponent={Link} size="sm" />
    </div>
  );
}
