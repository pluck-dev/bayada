"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cx, inputClass } from "./ui";

/** URL ?q= 검색 — Enter 로 적용, 다른 필터와 page 는 유지/초기화 */
export function SearchBox({ placeholder, param = "q" }: { placeholder: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get(param) ?? "");
  const [pending, start] = useTransition();

  useEffect(() => setValue(sp.get(param) ?? ""), [sp, param]);

  return (
    <form
      role="search"
      className="relative w-full max-w-[320px]"
      onSubmit={(e) => {
        e.preventDefault();
        const next = new URLSearchParams(sp.toString());
        if (value.trim()) next.set(param, value.trim());
        else next.delete(param);
        next.delete("page");
        start(() => router.push(`${pathname}?${next.toString()}`));
      }}
    >
      <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-subtle" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(inputClass, "pl-8!", pending && "opacity-60")}
      />
    </form>
  );
}
