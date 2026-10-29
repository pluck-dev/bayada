"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { buttonClass, cx } from "./ui";

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
    <div className="mt-3 flex items-center justify-between text-[12.5px] text-muted">
      <span className="tabular">
        총 {total.toLocaleString()}
        {unit}
        {pages > 1 && ` · ${page} / ${pages} 페이지`}
      </span>
      {pages > 1 && (
        <div className="flex gap-1.5">
          <Link
            href={href(page - 1)}
            aria-disabled={page <= 1}
            className={cx(buttonClass("secondary", "sm"), page <= 1 && "pointer-events-none opacity-40")}
          >
            이전
          </Link>
          <Link
            href={href(page + 1)}
            aria-disabled={page >= pages}
            className={cx(buttonClass("secondary", "sm"), page >= pages && "pointer-events-none opacity-40")}
          >
            다음
          </Link>
        </div>
      )}
    </div>
  );
}
