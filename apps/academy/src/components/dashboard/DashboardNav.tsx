"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, Compass, Receipt, UserRound } from "lucide-react";
import { cn } from "@bayada/ui";

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
    <nav aria-label="마이 메뉴" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-4 lg:flex-col lg:px-0">
      {items.map((it) => {
        // 결제 내역은 상세(/orders/[id])에서도 활성
        const active = pathname === it.href || (it.icon === Receipt && pathname.startsWith(`${it.href}/`));
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-body-sm font-bold transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-surface-sunken hover:text-ink",
            )}
          >
            <it.icon className={cn("h-4 w-4", active ? "text-brand-700" : "text-subtle")} aria-hidden />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
