"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  Filter,
  ThumbsUp,
  MessageSquare,
  Award,
  Users,
  Heart,
  Sparkles,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
} from "lucide-react";
import Link from "next/link";
import type { Review } from "@/types";
import type { ServiceData } from "@/types";

interface ReviewsClientProps {
  reviews: Review[];
  services: ServiceData[];
  averageRating: number;
}

// 서비스별 색상 맵
const serviceColors: Record<string, string> = {
  "skilled-nursing": "#ce0e2d",
  "private-assistive-care": "#0ea5e9",
  hospice: "#8b5cf6",
  "ltci-beneficiary-care": "#10b981",
  "physical-trainer": "#f59e0b",
  "transitional-care": "#ef4444",
  "patient-support": "#06b6d4",
  dct: "#6366f1",
  "long-term-care": "#84cc16",
  "senior-living": "#f97316",
  "mobile-clinical": "#ec4899",
  education: "#14b8a6",
};

function StarDisplay({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: 14, md: 18, lg: 24 };
  const px = sizes[size];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={px}
          className={
            i <= rating ? "fill-amber-400 text-amber-400" : "fill-black/10 text-black/10"
          }
        />
      ))}
    </div>
  );
}

function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView ? value.toFixed(decimals) : "0"}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

function RatingBar({
  star,
  count,
  total,
  delay,
}: {
  star: number;
  count: number;
  total: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className="flex w-12 items-center justify-end gap-1">
        <span className="text-sm font-medium text-black/[0.87]">{star}</span>
        <Star size={12} className="fill-amber-400 text-amber-400" />
      </div>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
      <span className="w-8 text-right text-sm text-black/60">{count}</span>
    </div>
  );
}

export function ReviewsClient({ reviews, services, averageRating }: ReviewsClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>("전체");

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  // 서비스 필터 목록 구성
  const serviceFilters = [
    { label: "전체", value: "전체" },
    ...services
      .filter((s) => reviews.some((r) => r.serviceType === s.slug))
      .map((s) => ({ label: s.nameKo, value: s.slug })),
  ];

  // 필터된 리뷰
  const filteredReviews =
    activeFilter === "전체"
      ? reviews
      : reviews.filter((r) => r.serviceType === activeFilter);

  // 5점 리뷰들 (특선)
  const fiveStarReviews = reviews.filter((r) => r.rating === 5);
  const featuredReviews = fiveStarReviews.slice(0, 3);

  // 나머지 리뷰 (그리드)
  const featuredIds = new Set(featuredReviews.map((r) => r.id));
  const gridReviews = filteredReviews.filter((r) => !featuredIds.has(r.id));

  // 평점 분포
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const fiveStarPct =
    reviews.length > 0
      ? Math.round((fiveStarReviews.length / reviews.length) * 100)
      : 0;

  const getServiceName = (slug: string) =>
    services.find((s) => s.slug === slug)?.nameKo ?? slug;

  const getServiceColor = (slug: string) =>
    serviceColors[slug] ?? "#ce0e2d";

  return (
    <div className="bg-white">
      {/* ─── 1. 트러스트 히어로 ─── */}
      <section className="relative overflow-hidden bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ce0e2d]/20 bg-white px-4 py-2"
            >
              <Sparkles size={14} className="text-[#ce0e2d]" />
              <span className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">인증된 이용자 후기</span>
            </motion.div>

            {/* 메인 타이틀 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              고객님의 이야기
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-lg text-black/60"
            >
              바야다홈헬스케어를 직접 경험한 분들의 생생한 후기를 확인하세요
            </motion.p>

            {/* 애니메이션 별점 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                  >
                    <Star
                      size={36}
                      className={
                        i <= Math.floor(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : i === Math.ceil(averageRating)
                          ? "fill-amber-200 text-amber-200"
                          : "fill-black/10 text-black/10"
                      }
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-end gap-2"
              >
                <span className="text-5xl font-bold text-black/[0.87]">{averageRating}</span>
                <span className="mb-1 text-xl text-black/50">/ 5</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-6 text-sm text-black/60"
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-[#ce0e2d]" />
                  총 {reviews.length}개 후기
                </span>
                <span className="h-4 w-px bg-black/10" />
                <span className="flex items-center gap-1.5">
                  <ThumbsUp size={14} className="text-[#ce0e2d]" />
                  이용자 만족도 97%
                </span>
                <span className="h-4 w-px bg-black/10" />
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#ce0e2d]" />
                  재이용 의향 95%
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. 통계 대시보드 ─── */}
      <section ref={statsRef} className="border-y border-black/[0.06] bg-white py-12">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                icon: <Star size={24} className="fill-amber-400 text-amber-400" />,
                label: "평균 평점",
                value: averageRating,
                suffix: "/5",
                decimals: 1,
              },
              {
                icon: <MessageSquare size={24} className="text-[#ce0e2d]" />,
                label: "총 후기",
                value: reviews.length,
                suffix: "건",
                decimals: 0,
              },
              {
                icon: <Award size={24} className="text-violet-500" />,
                label: "5점 비율",
                value: fiveStarPct,
                suffix: "%",
                decimals: 0,
              },
              {
                icon: <Heart size={24} className="text-rose-500" />,
                label: "재이용 의향",
                value: 95,
                suffix: "%",
                decimals: 0,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-6 text-center"
              >
                <div className="mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-black/[0.87]">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <p className="mt-1 text-sm text-black/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. 평점 분포 + 신뢰 배지 ─── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* 평점 분포 */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-8">
              <h2 className="mb-6 text-lg font-bold text-black/[0.87]">평점 분포</h2>
              <div className="space-y-3">
                {distribution.map((d, i) => (
                  <RatingBar
                    key={d.star}
                    star={d.star}
                    count={d.count}
                    total={reviews.length}
                    delay={i * 0.1}
                  />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4">
                <span className="text-sm text-black/60">전체 {reviews.length}개 후기 기준</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-black/[0.87]">{averageRating} 평균</span>
                </div>
              </div>
            </div>

            {/* 신뢰 배지 */}
            <div className="flex flex-col justify-center gap-4">
              <h2 className="text-lg font-bold text-black/[0.87]">신뢰할 수 있는 후기</h2>
              <p className="text-sm leading-relaxed text-black/60">
                바야다홈헬스케어의 모든 후기는 실제 서비스 이용자만 작성할 수 있습니다.
                철저한 인증 절차를 통해 신뢰할 수 있는 정보만을 제공합니다.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: <Shield size={20} className="text-[#ce0e2d]" />,
                    title: "인증된 이용자 후기",
                    desc: "실제 서비스 이용자만 후기를 작성할 수 있습니다",
                  },
                  {
                    icon: <CheckCircle size={20} className="text-emerald-500" />,
                    title: "실명 인증",
                    desc: "모든 후기 작성자의 신원을 확인합니다",
                  },
                  {
                    icon: <Award size={20} className="text-violet-500" />,
                    title: "서비스 이용 확인",
                    desc: "실제 서비스 이용 내역이 있는 분들만 작성 가능합니다",
                  },
                  {
                    icon: <ThumbsUp size={20} className="text-blue-500" />,
                    title: "편집 없는 진솔한 후기",
                    desc: "어떠한 수정도 없이 고객님의 원본 후기를 게재합니다",
                  },
                ].map((badge) => (
                  <div
                    key={badge.title}
                    className="flex items-start gap-4 rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-4"
                  >
                    <div className="mt-0.5 shrink-0">{badge.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-black/[0.87]">{badge.title}</p>
                      <p className="mt-0.5 text-xs text-black/60">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. 특선 후기 ─── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Best Reviews
            </span>
            <h2
              className="mt-2 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              베스트 후기
            </h2>
            <p className="mt-2 text-sm text-black/60">5점 만점을 받은 소중한 후기들입니다</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredReviews.map((review, i) => {
              const color = getServiceColor(review.serviceType);
              const isFirst = i === 0;
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${isFirst ? "lg:col-span-1 lg:row-span-1" : ""}`}
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  {/* 장식 따옴표 */}
                  <div
                    className="absolute right-4 top-4 opacity-10"
                    style={{ color }}
                  >
                    <Quote size={48} />
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <StarDisplay rating={review.rating} size="sm" />
                      <span
                        className="ml-2 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: `${color}15`, color }}
                      >
                        {getServiceName(review.serviceType)}
                      </span>
                    </div>

                    <blockquote className="relative mb-4">
                      <Quote
                        size={16}
                        className="mb-2 opacity-40"
                        style={{ color }}
                      />
                      <p className="text-sm leading-relaxed text-black/60">
                        {review.content}
                      </p>
                    </blockquote>

                    <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
                      <p className="text-sm font-medium text-black/[0.87]">— {review.author}</p>
                      <span className="text-xs text-black/50">{review.createdAt}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. 서비스 필터 ─── */}
      <section className="sticky top-0 z-10 border-b border-black/[0.06] bg-white py-4 shadow-sm">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <Filter size={16} className="shrink-0 text-black/50" />
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {serviceFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeFilter === f.value
                      ? "bg-[#ce0e2d] text-white shadow-sm"
                      : "bg-black/[0.06] text-black/60 hover:bg-black/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. 전체 후기 그리드 ─── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {gridReviews.length === 0 ? (
                <div className="py-20 text-center text-black/50">
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                  <p>해당 서비스의 후기가 없습니다</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {gridReviews.map((review, i) => {
                    const color = getServiceColor(review.serviceType);
                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5"
                        style={{ borderLeft: `3px solid ${color}` }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <StarDisplay rating={review.rating} size="sm" />
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ background: `${color}15`, color }}
                          >
                            {getServiceName(review.serviceType)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-black/60">{review.content}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs font-medium text-black/[0.87]">— {review.author}</p>
                          <span className="text-xs text-black/50">{review.createdAt}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── 7. 후기 작성 CTA ─── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl bg-[#f5f7f9] ring-1 ring-black/5"
          >
            <div className="flex flex-col items-center gap-6 px-8 py-12 text-center sm:flex-row sm:text-left">
              <div className="shrink-0 rounded-2xl bg-white ring-1 ring-black/5 p-4 shadow-sm">
                <MessageSquare size={32} className="text-[#ce0e2d]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black/[0.87]">
                  서비스를 이용해 보셨나요?
                </h3>
                <p className="mt-1 text-sm text-black/60">
                  소중한 경험을 나눠주시면 다른 분들께 큰 도움이 됩니다.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019]"
              >
                후기 작성하기
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 8. 하단 CTA ─── */}
      <section className="bg-[#f5f7f9] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              지금 바로 시작하세요
            </span>
            <h2
              className="mt-3 font-bold text-black/[0.87]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
            >
              직접 경험해 보세요
            </h2>
            <p className="mt-4 text-base text-black/60">
              수백 명의 이용자가 경험한 바야다홈헬스케어의 따뜻한 돌봄을
              직접 만나보세요.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ce0e2d] py-[13px] px-6 text-base font-medium text-white transition-colors hover:bg-[#980019] sm:w-auto"
              >
                <Phone size={18} />
                상담 신청하기
              </Link>
              <Link
                href="/membership"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#dfe6eb] py-[13px] px-6 text-base font-semibold text-black/[0.87] transition-colors hover:bg-[#cdd5dc] sm:w-auto"
              >
                <Sparkles size={18} />
                무료 멤버십 시작
              </Link>
            </div>

            {/* 미니 통계 */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-black/[0.06] pt-10">
              {[
                { value: "50+", label: "년 글로벌 경험" },
                { value: "97%", label: "이용자 만족도" },
                { value: "24/7", label: "긴급 연락 체계" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold text-black/[0.87]">{item.value}</p>
                  <p className="mt-1 text-xs text-black/60">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
