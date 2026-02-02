"use client";

import Link from "next/link";
import { ShoppingCart, BookOpen, User, Menu, X } from "lucide-react";
import { Button } from "@bayada/ui";
import { useState } from "react";
import { useDictionary } from "./DictionaryProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale }: { locale: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dict = useDictionary();

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--brand)]">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[color:var(--fg)]">
            BAYADA <span className="text-[color:var(--brand)]">Academy</span>
          </span>
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}/courses`}
            className="text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)]"
          >
            {dict.common.courses}
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)]"
          >
            {dict.common.myCourses}
          </Link>
        </nav>

        {/* 데스크톱 액션 */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/cart`}
            className="relative rounded-lg p-2 text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand)] text-[10px] font-bold text-white">
              0
            </span>
          </Link>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="outline" size="sm">
              <User className="mr-1.5 h-4 w-4" />
              {dict.common.login}
            </Button>
          </Link>
        </div>

        {/* 모바일 메뉴 토글 */}
        <button
          className="rounded-lg p-2 text-[color:var(--muted)] md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="border-t border-[color:var(--border)] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href={`/${locale}/courses`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.courses}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.myCourses}
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.cart}
            </Link>
            <Link
              href={`/${locale}/orders`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.orders}
            </Link>
            <hr className="border-[color:var(--border)]" />
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            <Link
              href={`/${locale}/auth/login`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--brand)] hover:bg-[color:var(--brand-bg)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.login}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
