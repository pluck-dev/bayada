"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-white"
        >
          <button
            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[color:var(--surface)]"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="flex items-start gap-3 pr-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fae6ea] text-xs font-bold text-[#ce0e2d]">
                Q
              </span>
              <span className="text-sm font-semibold text-[color:var(--fg)] sm:text-base">
                {item.q}
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-[color:var(--muted)] transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="border-t border-[color:var(--border)] px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#2563eb]">
                  A
                </span>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                  {item.a}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
