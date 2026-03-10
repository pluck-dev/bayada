"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function BayadaWaySection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-[1512px] mx-auto flex flex-col md:flex-row gap-10 lg:gap-20 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden">
        {/* 좌측: 텍스트 영역 */}
        <motion.div
          className="flex-1 space-y-10 sm:space-y-12"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] text-black/[0.87]">
              BAYADA: 50년간 이어온 우리의 사명
            </h2>
            <p className="text-base leading-[1.7] text-black/[0.7]">
              1975년부터 BAYADA는 아동, 성인, 노인이 가장 안전하다고 느끼는 곳, 바로
              &lsquo;집&rsquo;에서 필요한 돌봄을 받을 수 있도록 함께해 왔습니다.
              전국적인 홈 헬스케어 선도 기관으로서 우리의 사명은 분명합니다.
              연민과 전문성을 바탕으로, 모든 사람이 편안함과 독립성, 그리고 존엄성을
              지키며 살아갈 수 있도록 돕는 것입니다.
            </p>
            <p className="text-base leading-[1.7] text-black/[0.7]">
              우리 팀의 모든 구성원은 타인을 돕는 일에 깊은 열정을 가지고 있으며,
              탁월한 전문성과 진정성 있는 헌신을 결합해 비교할 수 없는 돌봄을 제공합니다.
              간호와 재활 치료부터 개인 돌봄과 일상생활 지원에 이르기까지, 우리는 고객과
              가족과 1:1로 협력하며 각자의 필요에 맞춘 맞춤형 케어를 제공합니다.
            </p>
            <p className="text-base leading-[1.7] text-black/[0.7]">
              또한 우리는 직원들에게도 같은 수준의 배려를 실천합니다.
              협력과 포용의 문화를 조성하여, 모든 구성원이 최고의 역량을 발휘해
              우리가 섬기는 사람들에게 온전히 헌신할 수 있도록 지원합니다.
            </p>
          </div>
          <div className="flex">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#dfe6eb] rounded-lg text-sm font-semibold text-black/[0.87] transition-colors hover:bg-[#ccd6de]"
            >
              BAYADA 더 알아보기
            </Link>
          </div>
        </motion.div>

        {/* 우측: 원형 콜라주 이미지 */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <Image
            src="/images/about/50-years-desktop.webp"
            alt="BAYADA 50주년 - 다양한 케어 현장"
            width={720}
            height={600}
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
