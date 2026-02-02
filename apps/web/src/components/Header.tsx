"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@bayada/ui";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";

interface HeaderProps {
  dict: Dictionary;
  locale: string;
}

export function Header({ dict, locale }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = dict.web;

  const megaMenus = [
    {
      key: "company",
      label: t.nav.company,
      items: [
        { label: t.nav.about, href: `/${locale}/about` },
        { label: t.nav.ceo, href: `/${locale}/ceo` },
        { label: t.nav.bayadaWay, href: `/${locale}/bayada-way` },
        { label: t.nav.center, href: `/${locale}/center` },
      ],
    },
    {
      key: "services",
      label: t.nav.services,
      items: [
        { label: t.nav.homeCare, href: `/${locale}/services/home-care` },
        { label: t.nav.visitingNursing, href: `/${locale}/services/visiting-nursing` },
        { label: t.nav.dementiaCare, href: `/${locale}/services/dementia-care` },
        { label: t.nav.careCoordinator, href: `/${locale}/services/care-coordinator` },
        { label: t.nav.customExercise, href: `/${locale}/services/custom-exercise` },
        { label: t.nav.musicTherapy, href: `/${locale}/services/music-therapy` },
        { label: t.nav.cognitiveTherapy, href: `/${locale}/services/cognitive-therapy` },
      ],
    },
    {
      key: "support",
      label: t.nav.support,
      items: [
        { label: t.nav.guide, href: `/${locale}/guide` },
        { label: t.nav.consultation, href: `/${locale}/consultation` },
        { label: t.nav.faq, href: `/${locale}/faq` },
      ],
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[color:var(--border)] bg-white/80 backdrop-blur-xl shadow-[var(--shadow-subtle)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Image
            src="/images/brand/logo.png"
            alt="BAYADA"
            width={120}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* 데스크톱 메가 메뉴 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {megaMenus.map((menu) => (
            <div
              key={menu.key}
              className="relative"
              onMouseEnter={() => setOpenMega(menu.key)}
              onMouseLeave={() => setOpenMega(null)}
            >
              <button
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--fg)] transition-colors hover:text-[#ce0e2d]"
              >
                {menu.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMega === menu.key ? "rotate-180" : ""}`} />
              </button>

              {openMega === menu.key && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
                  <div className="min-w-[200px] rounded-xl border border-[color:var(--border)] bg-white p-2 shadow-[var(--shadow-medium)]">
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg px-4 py-2.5 text-sm text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)] hover:text-[#ce0e2d]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 데스크톱 CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:1670-1379"
            className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
          >
            <Phone className="h-4 w-4" />
            {t.common.phone}
          </a>
          <Link href={`/${locale}/consultation`}>
            <Button size="md" variant="brand">
              {t.common.freeConsult}
            </Button>
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
        <div className="border-t border-[color:var(--border)] bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {megaMenus.map((menu) => (
              <div key={menu.key} className="mb-4">
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                  {menu.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--border)] pt-4">
              <a
                href="tel:1670-1379"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[color:var(--muted)]"
              >
                <Phone className="h-4 w-4" />
                {t.common.phone}
              </a>
              <Link href={`/${locale}/consultation`} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="md" variant="brand" className="w-full">
                  {t.common.freeConsult}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
