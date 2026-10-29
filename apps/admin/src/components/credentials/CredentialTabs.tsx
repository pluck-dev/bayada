"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

/** 바야다 인증 하위 메뉴 (역할별로 볼 수 있는 탭만 서버에서 넘겨준다) */
export function CredentialTabs({ items }: { items: { href: string; label: string; count?: number }[] }) {
  const pathname = usePathname();
  // 가장 긴 경로가 맞는 탭을 활성으로 (심사 큐 경로가 다른 탭의 접두어라서)
  const active = items
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  // 심사위원처럼 탭이 하나뿐이면 메뉴를 그리지 않는다
  if (items.length < 2) return null;
  return (
    <nav aria-label="바야다 인증 메뉴" className="mb-5 flex gap-5 border-b border-line">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active === i.href ? "page" : undefined}
          className={cx(
            "-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-[13px] font-medium transition-colors",
            active === i.href ? "border-zinc-900 text-fg" : "border-transparent text-muted hover:text-fg",
          )}
        >
          {i.label}
          {!!i.count && <span className="tabular rounded-full bg-zinc-100 px-1.5 text-[11px] text-zinc-600">{i.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
