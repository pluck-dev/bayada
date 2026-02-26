"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTACard {
  title: string;
  description?: string;
  href: string;
  linkText: string;
}

interface CTACardsProps {
  cards?: CTACard[];
  className?: string;
}

const defaultCards: CTACard[] = [
  {
    title: "BAYADA가 내 근처에 있나요?",
    description: "전국 주요 지역에서 BAYADA의 전문 홈헬스케어 서비스를 받으실 수 있습니다.",
    href: "/find-care",
    linkText: "서비스 지역 확인하기",
  },
  {
    title: "어떤 서비스를 제공하나요?",
    description: "방문요양, 방문간호, 재활치료 등 다양한 홈헬스케어 서비스를 제공합니다.",
    href: "/services",
    linkText: "서비스 전체 보기",
  },
];

export function CTACards({ cards = defaultCards, className = "" }: CTACardsProps) {
  return (
    <section className={`bg-white py-12 lg:py-16 ${className}`}>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card, index) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="text-xl font-bold leading-tight text-black/[0.87] sm:text-2xl">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="mt-3 text-sm leading-relaxed text-black/60">
                    {card.description}
                  </p>
                )}
              </div>

              <Link
                href={card.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#ce0e2d] transition-colors hover:text-[#980019]"
              >
                {card.linkText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
