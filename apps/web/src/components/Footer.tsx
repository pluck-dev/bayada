"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";

interface FooterProps {
  dict: Dictionary;
  locale: string;
}

export function Footer({ dict, locale }: FooterProps) {
  const t = dict.web;

  const footerSections = [
    {
      title: t.nav.company,
      links: [
        { label: t.nav.about, href: `/${locale}/about` },
        { label: t.nav.ceo, href: `/${locale}/ceo` },
        { label: t.nav.bayadaWay, href: `/${locale}/bayada-way` },
        { label: t.nav.center, href: `/${locale}/center` },
      ],
    },
    {
      title: t.nav.services,
      links: [
        { label: t.nav.homeCare, href: `/${locale}/services/home-care` },
        { label: t.nav.visitingNursing, href: `/${locale}/services/visiting-nursing` },
        { label: t.nav.dementiaCare, href: `/${locale}/services/dementia-care` },
        { label: t.nav.careCoordinator, href: `/${locale}/services/care-coordinator` },
      ],
    },
    {
      title: t.nav.support,
      links: [
        { label: t.nav.guide, href: `/${locale}/guide` },
        { label: t.nav.consultation, href: `/${locale}/consultation` },
        { label: t.nav.faq, href: `/${locale}/faq` },
        { label: t.nav.partners, href: `/${locale}/partners` },
      ],
    },
  ];

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="inline-block">
              <Image
                src="/images/brand/logo.png"
                alt="BAYADA"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <div className="mt-6 flex flex-col gap-3 text-sm text-[color:var(--muted)]">
              <p>{t.common.companyName}</p>
              <p>대표: 김영민 | 사업자등록번호: 696-81-00440</p>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                서울시 강남구 테헤란로 431, 7층 7005호
              </span>
              <a
                href="tel:1670-1379"
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Phone className="h-4 w-4" />
                {t.common.phone}
              </a>
              <a
                href="mailto:K-hhc@bayadakorea.com"
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Mail className="h-4 w-4" />
                K-hhc@bayadakorea.com
              </a>
            </div>

            {/* 외부 링크 */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[color:var(--muted)]">
              <a
                href="https://blog.naver.com/bayadakorea"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#ce0e2d]"
              >
                BAYADA 블로그
              </a>
              <span>|</span>
              <a
                href="https://www.bayada.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#ce0e2d]"
              >
                BAYADA Global
              </a>
            </div>
          </div>

          {/* 링크 섹션 */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-[color:var(--fg)]">
                {section.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 하단 */}
        <div className="mt-12 border-t border-[color:var(--border)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[color:var(--muted)]">
              &copy; {new Date().getFullYear()} {t.common.copyright}. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-[color:var(--muted)]">
              <Link href={`/${locale}/privacy`} className="transition-colors hover:text-[#ce0e2d]">
                {t.nav.privacy}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
