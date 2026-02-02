"use client";

import Link from "next/link";
import { ShoppingCart, BookOpen, User, Menu, X, Search, LogOut } from "lucide-react";
import { Button } from "@bayada/ui";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useDictionary } from "./DictionaryProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale }: { locale: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const dict = useDictionary();
  const isLoggedIn = !!session?.user;

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
          : "border-b border-transparent bg-white/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo area */}
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e31b34] to-[#a30b24] text-white shadow-md transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              BAYADA <span className="text-[#e31b34]">Academy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href={`/${locale}/courses`}
              className="text-[15px] font-medium text-gray-600 transition-colors hover:text-[#e31b34]"
            >
              {dict.common.courses}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="text-[15px] font-medium text-gray-600 transition-colors hover:text-[#e31b34]"
            >
              {dict.common.myCourses}
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="강의 검색..."
              className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50/50 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#e31b34] focus:bg-white focus:ring-2 focus:ring-[#e31b34]/10"
            />
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <LanguageSwitcher />

          {isLoggedIn ? (
            <>
              <Link
                href={`/${locale}/cart`}
                className="group relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>

              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{session.user?.name || "사용자"}</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="로그아웃"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`}>
                <Button className="rounded-full bg-gray-900 px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5">
                  {dict.common.login}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-t border-gray-100 bg-white/95 px-4 py-6 shadow-xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
             <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="강의 검색..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#e31b34] focus:ring-1 focus:ring-[#e31b34]"
              />
            </div>

            <Link
              href={`/${locale}/courses`}
              className="flex items-center justify-between rounded-xl p-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#e31b34]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.courses}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center justify-between rounded-xl p-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#e31b34]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.myCourses}
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="flex items-center justify-between rounded-xl p-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#e31b34]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.cart}
            </Link>
            <Link
              href={`/${locale}/orders`}
              className="flex items-center justify-between rounded-xl p-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#e31b34]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.common.orders}
            </Link>

            <hr className="my-2 border-gray-100" />

            <div className="px-3">
              <LanguageSwitcher />
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: `/${locale}` });
                }}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-gray-900 py-3.5 text-base font-bold text-white shadow-lg active:scale-95"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#e31b34] py-3.5 text-base font-bold text-white shadow-lg active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.common.login}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
