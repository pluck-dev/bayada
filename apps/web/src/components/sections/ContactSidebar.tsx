"use client";

import Link from "next/link";
import { Phone, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ExtraBlock {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface ContactSidebarProps {
  phone?: string;
  hours?: string;
  locale: string;
  extra?: ExtraBlock[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ContactSidebar({
  phone = "1588-0000",
  hours = "평일 09:00 - 18:00",
  locale,
  extra,
}: ContactSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="space-y-6"
    >
      {/* 상담 문의 카드 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-black/[0.87]">상담 문의</h3>
        <p className="mt-2 text-sm text-black/60">
          전문 상담사가 자세하게 안내해 드립니다.
        </p>

        {/* 전화번호 */}
        <a
          href={`tel:${phone.replace(/-/g, "")}`}
          className="mt-5 flex items-center gap-3 rounded-lg bg-[#f0f4f7] p-4 transition-colors hover:bg-gray-200/60"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ce0e2d]">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#ce0e2d]">{phone}</p>
            <p className="text-xs text-black/50">전화 상담</p>
          </div>
        </a>

        {/* 운영 시간 */}
        <div className="mt-4 flex items-center gap-2 text-sm text-black/60">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{hours}</span>
        </div>

        {/* 온라인 상담 버튼 */}
        <Link
          href={`/${locale}/consultation`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
        >
          온라인 상담 신청
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 추가 블록 */}
      {extra?.map((block) => (
        <div
          key={block.title}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-black/[0.87]">
            {block.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            {block.description}
          </p>
          {block.ctaLabel && block.ctaHref && (
            <Link
              href={block.ctaHref}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ce0e2d] transition-colors hover:text-[#980019]"
            >
              {block.ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ))}
    </motion.div>
  );
}
