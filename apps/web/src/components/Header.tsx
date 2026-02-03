"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";
import { mainNavigation } from "@/data/navigation";
import { MegaMenu } from "./header/MegaMenu";
import { MobileMenu } from "./header/MobileMenu";
import { LanguageSwitcher } from "./header/LanguageSwitcher";

interface HeaderProps {
  dict: Dictionary;
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 외부 클릭 시 메가 메뉴 닫기
  useEffect(() => {
    function handleClickOutside() {
      setOpenMega(null);
    }
    if (openMega) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMega]);

  function handleMouseEnter(label: string) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenMega(label);
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => setOpenMega(null), 150);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[color:var(--border)] bg-white/95 shadow-[var(--shadow-subtle)] backdrop-blur-xl"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/images/brand/logo.png"
            alt="BAYADA"
            width={120}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {mainNavigation.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children ? handleMouseEnter(item.label) : undefined}
              onMouseLeave={item.children ? handleMouseLeave : undefined}
            >
              {item.children ? (
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:text-[#ce0e2d] ${
                    openMega === item.label
                      ? "text-[#ce0e2d]"
                      : "text-[color:var(--fg)]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMega((prev) => (prev === item.label ? null : item.label));
                  }}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      openMega === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={`/${locale}${item.href}`}
                  className="rounded-lg px-3 py-2 text-[13px] font-medium text-[color:var(--fg)] transition-colors hover:text-[#ce0e2d]"
                >
                  {item.label}
                </Link>
              )}

              {/* 메가 메뉴 패널 */}
              {openMega === item.label && item.children && (
                <MegaMenu
                  item={item}
                  locale={locale}
                  onClose={() => setOpenMega(null)}
                />
              )}
            </div>
          ))}
        </nav>

        {/* 데스크톱 우측 CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/contact`}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)]"
          >
            Login
          </Link>
          <Link
            href={`/${locale}/membership`}
            className="rounded-full bg-[#ce0e2d] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#b00c27]"
          >
            Get Started
          </Link>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)] lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <MobileMenu locale={locale} onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  );
}
