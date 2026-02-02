"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@bayada/ui";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import type { Dictionary } from "@bayada/shared/i18n";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQPreviewProps {
  dict: Dictionary;
  locale: string;
  items: FAQItem[];
}

export function FAQPreview({ dict, locale, items }: FAQPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = dict.web.home;

  return (
    <SectionWrapper className="bg-[color:var(--surface)]">
      <Container narrow>
        <div className="text-center">
          <h2 className="text-display-lg font-bold text-[color:var(--fg)]">
            {t.faqTitle}
          </h2>
          <p className="mt-4 text-body-lg text-[color:var(--muted)]">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {items.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-white shadow-[var(--shadow-subtle)]"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="pr-4 text-sm font-semibold text-[color:var(--fg)] sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[color:var(--muted)] transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-[color:var(--border)] px-6 py-5">
                  <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href={`/${locale}/faq`}>
            <Button variant="outline">
              {t.faqViewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  );
}
