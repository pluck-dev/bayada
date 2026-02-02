"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  ShoppingCart,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { i18nConfig, type Locale } from "@bayada/shared";
import { useDictionary } from "./DictionaryProvider";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const dict = useDictionary();

  // 현재 locale 추출
  const currentLocale =
    (i18nConfig.locales.find(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) as Locale) ?? i18nConfig.defaultLocale;

  const navItems = [
    { href: `/${currentLocale}`, label: dict.admin.dashboard, icon: LayoutDashboard },
    { href: `/${currentLocale}/courses`, label: dict.admin.courseManagement, icon: BookOpen },
    { href: `/${currentLocale}/users`, label: dict.admin.userManagement, icon: Users },
    { href: `/${currentLocale}/organizations`, label: dict.admin.orgManagement, icon: Building2 },
    { href: `/${currentLocale}/orders`, label: dict.admin.orderManagement, icon: ShoppingCart },
    { href: `/${currentLocale}/invoices`, label: dict.admin.invoiceManagement, icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === `/${currentLocale}`) return pathname === `/${currentLocale}`;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r border-[color:var(--border)] bg-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* 로고 */}
      <div className="flex h-16 items-center border-b border-[color:var(--border)] px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ce0e2d]">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <div>
              <span className="text-base font-bold text-[color:var(--fg)]">
                BAYADA
              </span>
              <span className="ml-1.5 text-xs font-medium text-[color:var(--muted)]">
                Admin
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#ce0e2d]">
            <span className="text-sm font-bold text-white">B</span>
          </div>
        )}
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#fae6ea] text-[#ce0e2d]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? "text-[#ce0e2d]" : ""
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 접기/펼치기 버튼 */}
      <div className="border-t border-[color:var(--border)] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">{dict.common.back}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
