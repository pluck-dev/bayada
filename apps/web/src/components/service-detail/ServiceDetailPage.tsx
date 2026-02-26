"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Phone,
  ArrowRight,
  MapPin,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from "lucide-react";
import type { ServiceData } from "@/types";
import type { ServicePageDetail } from "@/data/service-page-details";

interface ServiceDetailPageProps {
  service: ServiceData;
  detail: ServicePageDetail;
  relatedServices: ServiceData[];
  locale: string;
}

/* ── 히어로 배너 (라이트 배경) ── */
function HeroBanner({ service, locale }: { service: ServiceData; locale: string }) {
  return (
    <section className="bg-gradient-to-br from-[#e8f4f8] to-[#f0f4f8] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-[1512px]">
        {/* 브레드크럼 */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-black/40">
          <Link href={`/${locale}`} className="hover:text-[#ce0e2d] transition-colors">
            홈
          </Link>
          <span>/</span>
          <Link href={`/${locale}/what-we-do`} className="hover:text-[#ce0e2d] transition-colors">
            서비스 소개
          </Link>
          <span>/</span>
          <span className="text-black/60 font-medium">{service.nameKo}</span>
        </nav>

        <h1 className="text-3xl font-bold text-black/[0.87] sm:text-4xl lg:text-5xl">
          {service.nameKo}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-black/50 sm:text-base">
          {service.nameEn}
        </p>
        <Link
          href={`/${locale}/contact`}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
        >
          <MapPin className="h-4 w-4" />
          서비스 찾기
        </Link>
      </div>
    </section>
  );
}

/* ── 메인 콘텐츠 (헤드라인 + 설명 + 히어로 이미지) ── */
function ContentSection({
  detail,
  locale,
}: {
  detail: ServicePageDetail;
  locale: string;
}) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1512px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="whitespace-pre-line text-3xl font-bold leading-tight text-black/[0.87] sm:text-4xl lg:text-5xl">
              {detail.headline}
            </h2>
            <p className="mt-8 text-base leading-relaxed text-black/60 lg:text-lg">
              {detail.longDescription}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
            >
              상담 신청
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* 히어로 이미지 */}
          <motion.div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Image
              src={detail.heroImage}
              alt={detail.headline}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* 섹션 구분선 */}
      <div className="mx-auto mt-20 max-w-[1512px]">
        <hr className="border-gray-100" />
      </div>
    </section>
  );
}

/* ── 관련 서비스 수평 캐러셀 ── */
function RelatedServicesSection({
  services,
  locale,
}: {
  services: ServiceData[];
  locale: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (services.length === 0) return null;

  return (
    <section className="bg-[#f5f7f9] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black/[0.87] sm:text-2xl">
            가족에게 도움이 될 수 있는 다른 서비스
          </h2>
          {/* 화살표 버튼 */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-black/50 transition-colors hover:border-[#ce0e2d] hover:text-[#ce0e2d]"
              aria-label="이전"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-black/50 transition-colors hover:border-[#ce0e2d] hover:text-[#ce0e2d]"
              aria-label="다음"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 수평 스크롤 카드 */}
        <div
          ref={scrollRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/${locale}/what-we-do/${s.slug}`}
              className="group w-[220px] shrink-0 snap-start rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-3 text-sm font-semibold text-black/[0.87] transition-colors group-hover:text-[#ce0e2d]">
                {s.nameKo}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-black/50">{s.nameEn}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 더 알아보기 아코디언 ── */
function LearnMoreSection({
  service,
  detail,
}: {
  service: ServiceData;
  detail: ServicePageDetail;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* 좌측 타이틀 (스크롤 시 sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-bold text-black/[0.87] sm:text-3xl">
              BAYADA {service.nameKo} 서비스
              <br />
              자세히 알아보기
            </h2>
          </div>

          {/* 우측 아코디언 */}
          <div className="divide-y divide-gray-200">
            {detail.learnMoreItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.title}>
                  <button
                    className="flex w-full items-center justify-between py-5 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span
                      className={`text-sm font-semibold transition-colors sm:text-base ${
                        isOpen ? "text-[#ce0e2d]" : "text-black/[0.87]"
                      }`}
                    >
                      {item.title}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-black/40 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-40 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-black/60">
                      {item.content}
                    </p>
                  </div>
                  {/* 하단 열림 강조 라인 */}
                  {isOpen && (
                    <div className="h-[2px] w-full origin-left animate-[expand_0.3s_ease-out] bg-[#ce0e2d]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 리드 마그넷 (다운로드 CTA) ── */
function LeadMagnetSection({
  detail,
}: {
  detail: ServicePageDetail;
}) {
  if (!detail.leadMagnet) return null;
  return (
    <section className="bg-[#f5f7f9] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="whitespace-pre-line text-xl font-bold text-black/[0.87] sm:text-2xl lg:text-3xl">
          {detail.leadMagnet.title}
        </h2>
        <p className="mt-4 text-sm text-black/60 lg:text-base">
          {detail.leadMagnet.description}
        </p>
        <button className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]">
          무료 자료 다운로드
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/* ── 케어팀 섹션 ── */
function CareTeamSection({ detail }: { detail: ServicePageDetail }) {
  const icons = [
    "/images/care-team/icons/book.svg",
    "/images/care-team/icons/clipboard.svg",
    "/images/care-team/icons/community.svg",
    "/images/care-team/icons/home-health.svg",
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 lg:gap-16">
          {/* 좌측 이미지 */}
          <motion.div
            className="relative min-h-[400px] overflow-hidden rounded-2xl md:min-h-[500px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/care-team/1.webp"
              alt="BAYADA 케어 전문가"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* 우측 텍스트 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40">
              Service Type
            </p>
            <h2 className="mt-2 text-2xl font-bold text-black/[0.87] sm:text-3xl">
              {detail.careTeamTitle}
            </h2>
            <p className="mt-2 text-base text-black/60">
              {detail.careTeamDescription}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {detail.careTeamFeatures.map((feature, idx) => (
                <div key={feature} className="flex flex-col items-center text-center">
                  <div className="flex h-[50px] w-[60px] items-center justify-center">
                    <img
                      src={icons[idx % icons.length]}
                      alt=""
                      width={60}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium leading-snug text-black/[0.87]">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 채용 CTA (레드 배너) ── */
function JoinTeamSection({
  detail,
  locale,
}: {
  detail: ServicePageDetail;
  locale: string;
}) {
  const qualifications = [
    { label: "자격 요건", value: "관련 자격증 보유자" },
    { label: "근무 형태", value: "정규직 / 파트타임" },
    { label: "경력", value: "신입 / 경력 모두 환영" },
  ];

  return (
    <section className="bg-[#ce0e2d] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
            {detail.joinTeamTitle}
          </h2>
          <p className="mt-4 text-sm text-white/80 lg:text-base">
            {detail.joinTeamDescription}
          </p>
        </div>

        {/* 자격 조건 그리드 */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {qualifications.map((q) => (
            <div
              key={q.label}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-5 text-center backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {q.label}
              </p>
              <p className="mt-2 text-sm font-bold text-white sm:text-base">
                {q.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/careers`}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#ce0e2d] transition-colors hover:bg-gray-100"
          >
            채용 정보 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ 섹션 (전체 너비) ── */
function FAQSection({ detail }: { detail: ServicePageDetail }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-black/[0.87] sm:text-3xl">
            자주 묻는 질문
          </h2>
          <p className="mt-2 text-sm text-black/50">
            서비스 이용에 대해 자주 묻는 질문과 답변입니다
          </p>
        </div>

        {/* 전체 너비 FAQ 아코디언 */}
        <div className="divide-y divide-gray-200">
          {detail.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.question}>
                <button
                  className="flex w-full items-center justify-between py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span
                    className={`pr-4 text-sm font-semibold transition-colors sm:text-base ${
                      isOpen ? "text-[#ce0e2d]" : "text-black/[0.87]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-black/40 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-60 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-black/60">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 하단 문의 CTA ── */
function ContactCTASection({ locale }: { locale: string }) {
  return (
    <section className="bg-[#e8edf2] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-xl font-bold text-black/[0.87] sm:text-2xl lg:text-3xl">
          어떤 서비스가 필요하신지 잘 모르시겠나요?
        </h2>
        <p className="mt-2 text-sm text-black/50">
          상담을 신청하시면 전문 상담원이 연락드립니다
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
          >
            상담 신청하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:1670-1379"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-black/[0.87] transition-colors hover:bg-gray-50"
          >
            <Phone className="h-4 w-4" />
            1670-1379
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── 하단 듀얼 CTA 카드 섹션 ── */
function BottomCTASection({ locale }: { locale: string }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1512px]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 카드 1: 오피스 찾기 */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-gray-50 p-10 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d]/10">
              <MapPin className="h-7 w-7 text-[#ce0e2d]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-black/[0.87]">
              BAYADA가 가까이에 있나요?
            </h3>
            <p className="mt-2 text-sm text-black/50">
              가장 가까운 BAYADA 오피스를 찾아보세요
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#ce0e2d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#980019]"
            >
              오피스 찾기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* 카드 2: 서비스 보기 */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-gray-50 p-10 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ce0e2d]/10">
              <HeartPulse className="h-7 w-7 text-[#ce0e2d]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-black/[0.87]">
              어떤 서비스를 제공하나요?
            </h3>
            <p className="mt-2 text-sm text-black/50">
              BAYADA의 모든 홈케어 서비스를 확인해보세요
            </p>
            <Link
              href={`/${locale}/what-we-do`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-[#ce0e2d] px-6 py-3 text-sm font-semibold text-[#ce0e2d] transition-colors hover:bg-[#ce0e2d] hover:text-white"
            >
              서비스 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 메인 컴포넌트 ── */
export function ServiceDetailPage({
  service,
  detail,
  relatedServices,
  locale,
}: ServiceDetailPageProps) {
  return (
    <main>
      <HeroBanner service={service} locale={locale} />
      <ContentSection detail={detail} locale={locale} />
      <RelatedServicesSection services={relatedServices} locale={locale} />
      <LearnMoreSection service={service} detail={detail} />
      <LeadMagnetSection detail={detail} />
      <CareTeamSection detail={detail} />
      <JoinTeamSection detail={detail} locale={locale} />
      <FAQSection detail={detail} />
      <BottomCTASection locale={locale} />
      <ContactCTASection locale={locale} />
    </main>
  );
}
