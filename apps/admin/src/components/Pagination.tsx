"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@bayada/ui";

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unit?: string;
}

export function Pagination({
  total,
  page,
  totalPages,
  unit = "건",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[color:var(--muted)]">
        전체 {total}
        {unit}
        {totalPages > 1 && (
          <span className="ml-2">
            ({page} / {totalPages} 페이지)
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => goToPage(page - 1)}
        >
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => goToPage(page + 1)}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
