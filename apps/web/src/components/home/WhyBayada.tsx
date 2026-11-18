"use client";
import type { WEB_PAGE_DEFAULTS } from "@bayada/shared/web-page-content";

import Image from "next/image";
import { motion } from "framer-motion";

export function WhyBayada({ features }: { features: typeof WEB_PAGE_DEFAULTS.home.features }) {
  if (!features.length) return null;
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] grid grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-[450px_1fr] md:gap-16 lg:grid-cols-[600px_1fr] lg:gap-20 lg:px-12">

        {/* 좌측: 단일 대형 간호사 사진 - 모바일 order-2, 데스크탑 order-1 */}
        <motion.div
          className="order-2 md:order-1 relative overflow-hidden rounded-2xl min-h-[400px] md:min-h-[520px] lg:min-h-[600px]"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* 메인 간호사 사진 */}
          <Image
            src="/images/care-team/1.webp"
            alt="BAYADA 케어 전문가"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 600px"
            priority
          />
        </motion.div>

        {/* 우측: 텍스트 + 아이콘 그리드 - 모바일 order-1, 데스크탑 order-2 */}
        <motion.div
          className="order-1 flex flex-col justify-center md:order-2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <h2
            className="font-bold leading-[1.15] text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            사랑하는 사람들을 위한
            <br />
            최고의 전문 케어 팀
          </h2>
          <p className="mt-3 text-base leading-relaxed text-black/60">
            진심으로 이끌고, 임상적 탁월함으로 강화합니다
          </p>

          {/* 아이콘 그리드: 모바일 2×2, sm 이상 4×1 */}
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-[50px] w-[60px] items-center justify-center">
                  <img
                    src={feature.icon}
                    alt={feature.alt}
                    width={60}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-[12px] font-medium leading-snug text-black/[0.87]">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
