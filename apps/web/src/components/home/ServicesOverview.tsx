"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@bayada/ui";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import type { Dictionary } from "@bayada/shared/i18n";

interface ServiceItem {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
}

interface ServicesOverviewProps {
  dict: Dictionary;
  locale: string;
  services: ServiceItem[];
}

export function ServicesOverview({ dict, locale, services }: ServicesOverviewProps) {
  const t = dict.web.home;

  return (
    <SectionWrapper className="bg-[color:var(--surface)]">
      <Container>
        <div className="text-center">
          <h2 className="text-display-lg font-bold text-[color:var(--fg)]">
            {t.servicesTitle}
          </h2>
          <p className="mt-4 text-body-lg text-[color:var(--muted)]">
            {t.servicesSubtitle}
          </p>
        </div>

        <StaggerChildren className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.slice(0, 7).map((service) => (
            <StaggerItem key={service.key}>
              <Link
                href={`/${locale}${service.href}`}
                className="group block overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-subtle)] transition-all hover:shadow-[var(--shadow-medium)] hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {service.subtitle && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[color:var(--fg)]">
                      {service.subtitle}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[color:var(--fg)] group-hover:text-[#ce0e2d] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[color:var(--muted)]">
                    {service.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#ce0e2d]">
                    {dict.web.services.viewDetail}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <div className="mt-12 text-center">
          <Link href={`/${locale}/services`}>
            <Button variant="outline" size="lg">
              {t.viewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  );
}
