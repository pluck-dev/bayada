"use client";

import { Button } from "@bayada/ui";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

export function CTASection() {
  const dict = useDictionary();

  return (
    <section id="contact" className="bg-[color:var(--bg)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ce0e2d] via-[#b50c27] to-[#7a0819] px-8 py-16 sm:px-12 sm:py-20 lg:px-16">
          {/* 장식 요소 */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {dict.web.ctaTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              {dict.web.ctaDescription}
            </p>

            {/* CTA 버튼 */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-white text-[#ce0e2d] hover:bg-white/90 sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {dict.web.ctaButton}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="tel:1588-0000" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  1588-0000
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 하단 안내 카드 */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[color:var(--border)] bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fae6ea]">
              <Phone className="h-6 w-6 text-[#ce0e2d]" />
            </div>
            <h3 className="mt-4 font-semibold text-[color:var(--fg)]">
              {dict.web.heroButton}
            </h3>
            <a
              href="tel:1588-0000"
              className="mt-3 inline-block text-sm font-medium text-[#ce0e2d]"
            >
              1588-0000
            </a>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fae6ea]">
              <MessageCircle className="h-6 w-6 text-[#ce0e2d]" />
            </div>
            <h3 className="mt-4 font-semibold text-[color:var(--fg)]">
              {dict.web.ctaButton}
            </h3>
            <a
              href="#"
              className="mt-3 inline-block text-sm font-medium text-[#ce0e2d]"
            >
              {dict.web.learnMore}
            </a>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fae6ea]">
              <MessageCircle className="h-6 w-6 text-[#ce0e2d]" />
            </div>
            <h3 className="mt-4 font-semibold text-[color:var(--fg)]">
              {dict.web.learnMore}
            </h3>
            <a
              href="#"
              className="mt-3 inline-block text-sm font-medium text-[#ce0e2d]"
            >
              {dict.web.learnMore}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
