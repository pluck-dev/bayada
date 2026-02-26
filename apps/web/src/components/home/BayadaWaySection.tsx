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
              1975년 설립 이래, BAYADA는 아동, 성인, 시니어분들이 가장 안전하다고
              느끼는 곳인 가정에서 필요한 케어를 받을 수 있도록 도와왔습니다.
              홈헬스케어 분야의 리더로서, 우리의 사명은 간단합니다: 따뜻한 마음과
              전문적인 케어로 사람들이 편안하고 독립적이며 존엄한 삶을 살도록 돕는 것입니다.
            </p>
            <p className="text-base leading-[1.7] text-black/[0.7]">
              간호와 치료부터 개인 돌봄과 일상 생활 지원까지, BAYADA 팀은 각 가정과
              1대1로 소통하며 맞춤형 서비스를 제공합니다. 직원들에게도 같은 관심을
              기울여 협력과 포용의 문화를 만들어갑니다.
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
