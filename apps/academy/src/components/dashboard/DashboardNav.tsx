"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, Compass, Receipt, UserRound } from "lucide-react";

export function DashboardNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}/dashboard`;
  const items = [
    { href: base, label: "마이 러닝", icon: BookOpen },
    { href: `${base}/certificates`, label: "인증서", icon: Award },
    { href: `${base}/goals`, label: "커리어 목표", icon: Compass },
    { href: `/${locale}/orders`, label: "결제 내역", icon: Receipt },
    { href: `${base}/profile`, label: "프로필", icon: UserRound },
  ];
  return (
    <nav aria-label="마이 메뉴" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((it) => {
        // 결제 내역은 상세(/orders/[id])에서도 활성
        const active = pathname === it.href || (it.icon === Receipt && pathname.startsWith(`${it.href}/`));
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-white text-ink shadow-card ring-1 ring-line" : "text-ink-soft hover:bg-white hover:text-ink"
            }`}
          >
            <it.icon className={`h-4 w-4 ${active ? "text-brand" : "text-subtle"}`} aria-hidden />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
