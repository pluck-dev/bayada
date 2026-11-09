"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "./ui/kit/Select";

/** URL 쿼리 기반 선택 필터 (알약 트리거 + 디자인된 목록) */
export function SelectFilter({
  param,
  label,
  value,
  options,
}: {
  param: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  return (
    <Select
      size="sm"
      aria-label={label}
      value={value}
      options={options}
      className={pending ? "opacity-60" : undefined}
      onChange={(v) => {
        const next = new URLSearchParams(sp.toString());
        if (v) next.set(param, v);
        else next.delete(param);
        next.delete("page");
        start(() => router.push(`${pathname}?${next.toString()}`));
      }}
    />
  );
}
