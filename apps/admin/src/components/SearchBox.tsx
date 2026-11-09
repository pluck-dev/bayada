"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { cx, inputSmClass } from "./ui";

/** URL ?q= 검색 — Enter 로 적용, 다른 필터는 유지하고 page 는 초기화. 지우기 버튼은 직접 그린다(브라우저 기본 X 숨김) */
export function SearchBox({ placeholder, param = "q" }: { placeholder: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get(param) ?? "");
  const [pending, start] = useTransition();

  useEffect(() => setValue(sp.get(param) ?? ""), [sp, param]);

  const go = (q: string) => {
    const next = new URLSearchParams(sp.toString());
    if (q.trim()) next.set(param, q.trim());
    else next.delete(param);
    next.delete("page");
    start(() => router.push(`${pathname}?${next.toString()}`));
  };

  return (
    <form
      role="search"
      className="relative w-full max-w-[300px]"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      {pending ? (
        <LoaderCircle className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" aria-hidden />
      ) : (
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
      )}
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(inputSmClass, "pl-10 pr-9 font-medium")}
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => {
            setValue("");
            if (sp.get(param)) go("");
          }}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </form>
  );
}
