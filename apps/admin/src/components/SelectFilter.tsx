"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cx, selectClass } from "./ui";

/** URL 쿼리 기반 select 필터 */
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
  return (
    <select
      aria-label={label}
      value={value}
      className={cx(selectClass, "w-auto! min-w-[140px]")}
      onChange={(e) => {
        const next = new URLSearchParams(sp.toString());
        if (e.target.value) next.set(param, e.target.value);
        else next.delete(param);
        next.delete("page");
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
