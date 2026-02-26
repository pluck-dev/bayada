"use client";

import { type ElementType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@bayada/ui";

interface ActionCard {
  icon: ElementType;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
}

interface DualActionCardsProps {
  cards: [ActionCard, ActionCard];
  locale: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function DualActionCards({ cards }: DualActionCardsProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const isPrimary = index === 0;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease,
                }}
                className="group flex flex-col justify-between rounded-2xl bg-white p-8 ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce0e2d]/10">
                    <Icon className="h-5 w-5 text-[#ce0e2d]" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-black/[0.87]">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="mt-2 text-sm leading-relaxed text-black/60">
                      {card.description}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    href={card.ctaHref}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors",
                      isPrimary
                        ? "bg-[#ce0e2d] text-white hover:bg-[#980019]"
                        : "border border-black/10 bg-white text-black/[0.87] hover:border-black/20"
                    )}
                  >
                    {card.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
