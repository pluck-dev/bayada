"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";
import { footerNavigation, getLabel, getTitle } from "@/data/navigation";
import { getCompanyInfo } from "@/data/content";

interface FooterProps {
  dict: Dictionary;
  locale: string;
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer({ dict, locale }: FooterProps) {
  const company = getCompanyInfo();
  const sections = [
    footerNavigation.services,
    footerNavigation.company,
    footerNavigation.resources,
    footerNavigation.platform,
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
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
            <div className="mt-6 flex flex-col gap-2.5 text-sm text-black/60">
              <p>{company.legalName}</p>
              <p>대표: {company.ceo} | 사업자등록번호: {company.businessRegistrationNo}</p>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {company.headquarters}
              </span>
              <a
                href={`tel:${company.serviceHotline}`}
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Phone className="h-4 w-4" />
                {company.serviceHotline}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Mail className="h-4 w-4" />
                {company.email}
              </a>
            </div>

            {/* 소셜 미디어 */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-black/60 transition-colors duration-300 hover:bg-[#ce0e2d] hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <div className="mt-4 text-xs text-black/40">
              DEILEA.AI
            </div>
          </div>

          {/* 4컬럼 링크 */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-black/[0.87]">
                {getTitle(section, locale)}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-black/60 transition-colors hover:text-black"
                    >
                      {getLabel(link, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 하단 법적 링크 */}
        <div className="mt-12 border-t border-gray-100 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap gap-4 text-xs text-black/40">
              {footerNavigation.legal.map((link, i) => (
                <span key={link.href} className="flex items-center gap-4">
                  {i > 0 && <span className="text-gray-200">|</span>}
                  <Link
                    href={`/${locale}${link.href}`}
                    className="transition-colors hover:text-black/70"
                  >
                    {getLabel(link, locale)}
                  </Link>
                </span>
              ))}
            </div>
            <p className="text-xs text-black/40">
              &copy; {new Date().getFullYear()} BAYADA Home Health Care Korea. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
