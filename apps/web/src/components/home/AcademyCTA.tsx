"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface AcademyCTAProps {
  locale: string;
}

export function AcademyCTA({ locale }: AcademyCTAProps) {
  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12"
      style={{
        background:
          "linear-gradient(134deg, rgb(220, 237, 249) 21.29%, rgb(221, 238, 236) 92.92%)",
      }}
    >
      <div className="max-w-screen-xl mx-auto space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl">
            함께 더 나은 세상을 만들어요!
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/[0.7] max-w-[685px] mx-auto">
            매일 의미 있는 변화를 만들고 싶으신가요? BAYADA와 함께 보람 있는
            커리어를 시작하고, 가족들이 가장 신뢰하는 팀의 일원이 되어보세요.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={`/${locale}/careers`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors duration-300 hover:bg-[#980019]"
            >
              채용 정보 보기
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
