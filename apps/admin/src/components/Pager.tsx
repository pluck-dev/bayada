"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "./ui";

/** 페이지 번호 목록 — 앞뒤 1쪽 + 처음·끝, 사이는 … */
function pageList(page: number, pages: number): (number | "…")[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

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
  const arrow =
    "flex size-9 items-center justify-center rounded-full bg-canvas text-ink-soft transition-colors hover:bg-wash-strong hover:text-ink aria-disabled:pointer-events-none aria-disabled:opacity-35";
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <span className="num text-[13px] font-semibold text-muted">
        총 <b className="font-extrabold text-ink">{total.toLocaleString()}</b>
        {unit}
      </span>
      {pages > 1 && (
        <nav aria-label="페이지" className="flex items-center gap-1">
          <Link href={href(page - 1)} aria-label="이전 페이지" aria-disabled={page <= 1} className={arrow}>
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
          {pageList(page, pages).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="w-6 text-center text-[13px] text-subtle">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={cx(
                  "num flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[13px] font-bold transition-colors",
                  p === page ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas hover:text-ink",
                )}
              >
                {p}
              </Link>
            ),
          )}
          <Link href={href(page + 1)} aria-label="다음 페이지" aria-disabled={page >= pages} className={arrow}>
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </nav>
      )}
    </div>
  );
}
