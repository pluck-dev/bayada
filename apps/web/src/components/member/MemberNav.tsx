"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  House,
  MessageSquareText,
  Pill,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@bayada/ui";

export type NavKey = "home" | "bookings" | "health" | "medications" | "visits" | "family" | "inquiries" | "settings" | "schedule" | "education" | "organization";

const ITEMS: Record<NavKey, { path: string; label: string; icon: typeof House }> = {
  home: { path: "", label: "마이페이지 홈", icon: House },
  bookings: { path: "/bookings", label: "서비스 예약", icon: CalendarCheck },
  health: { path: "/health", label: "건강 기록", icon: Activity },
  medications: { path: "/medications", label: "복약 관리", icon: Pill },
  visits: { path: "/visits", label: "방문 기록", icon: ClipboardList },
  family: { path: "/family", label: "가족 연결", icon: Users },
  schedule: { path: "/schedule", label: "방문 일정", icon: CalendarClock },
  education: { path: "/education", label: "교육 현황", icon: GraduationCap },
  organization: { path: "/organization", label: "기관 정보", icon: Building2 },
  inquiries: { path: "/inquiries", label: "상담·문의 내역", icon: MessageSquareText },
  settings: { path: "/settings", label: "회원 정보·설정", icon: Settings },
};

// 데스크톱은 왼쪽 세로 메뉴, 휴대폰은 위쪽 가로 스크롤 알약
export function MemberNav({ locale, items, dots }: { locale: string; items: NavKey[]; dots?: Partial<Record<NavKey, boolean>> }) {
  const pathname = usePathname();
  const base = `/${locale}/my-page`;
  const isActive = (p: string) => (p === "" ? pathname === base : pathname === base + p || pathname.startsWith(`${base}${p}/`));

  return (
    <nav aria-label="마이페이지 메뉴" className="-mx-4 lg:mx-0">
      <ul className="scrollbar-hide flex gap-1.5 overflow-x-auto px-4 lg:sticky lg:top-24 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {items.map((k) => {
          const it = ITEMS[k];
          const on = isActive(it.path);
          const Icon = it.icon;
          return (
            <li key={k} className="shrink-0">
              <Link
                href={base + it.path}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors lg:h-11 lg:rounded-xl",
                  on ? "bg-[#ce0e2d] text-white" : "bg-white text-gray-700 hover:bg-gray-100 lg:bg-transparent",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {it.label}
                {dots?.[k] && <span className={cn("size-2 rounded-full", on ? "bg-white" : "bg-[#ce0e2d]")} aria-label="새 요청" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
