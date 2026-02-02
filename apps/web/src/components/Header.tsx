"use client";

import { useState } from "react";
import { Button } from "@bayada/ui";
import { Menu, X, Phone } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dict = useDictionary();

  const navLinks = [
    { label: dict.web.services, href: "#services" },
    { label: dict.web.education, href: "#education" },
    { label: dict.web.aboutTitle, href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ce0e2d]">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#ce0e2d]">
            BAYADA
          </span>
        </a>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[color:var(--fg)] transition-colors hover:text-[#ce0e2d]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* 데스크톱 CTA + 언어 변경 */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <a
            href="tel:1588-0000"
            className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--muted)]"
          >
            <Phone className="h-4 w-4" />
            1588-0000
          </a>
          <a href="#contact">
            <Button size="md" variant="brand">
              {dict.web.heroButton}
            </Button>
          </a>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)] md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="border-t border-[color:var(--border)] bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--border)] pt-4">
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
              <a
                href="tel:1588-0000"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[color:var(--muted)]"
              >
                <Phone className="h-4 w-4" />
                1588-0000
              </a>
              <a href="#contact" className="block">
                <Button size="md" variant="brand" className="w-full">
                  {dict.web.heroButton}
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
