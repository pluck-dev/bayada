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
    <nav aria-label="바야다 인증 메뉴" className="mb-6 inline-flex gap-1 rounded-full bg-canvas p-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active === i.href ? "page" : undefined}
          className={cx(
            "flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition-colors",
            active === i.href ? "bg-ink text-white" : "text-muted hover:bg-wash hover:text-ink",
          )}
        >
          {i.label}
          {!!i.count && (
            <span
              className={cx(
                "num inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold",
                "bg-brand text-white",
              )}
            >
              {i.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
