"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { reviews, getAverageRating } from "@/data/reviews";

export function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const displayReviews = reviews.slice(0, 8);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % displayReviews.length);
  }, [displayReviews.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);
  }, [displayReviews.length]);

  // 자동 슬라이드 (5초)
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const review = displayReviews[current];
  const avgRating = getAverageRating();

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <section className="py-[var(--section-gap)] bg-[color:var(--surface)]">
      <Container>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              Reviews
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--fg)] sm:text-4xl">
              이용자 후기
            </h2>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? "fill-[#f59e0b] text-[#f59e0b]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[color:var(--fg)]">
                {avgRating}
              </span>
              <span className="text-sm text-[color:var(--muted)]">
                ({reviews.length}개 리뷰)
              </span>
            </div>
          </div>
        </FadeIn>

        {/* 캐러셀 */}
        <div className="relative mt-12 mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-white p-6 sm:p-10 min-h-[200px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* 별점 */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-[#f59e0b] text-[#f59e0b]"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {/* 리뷰 내용 */}
                <p className="mt-4 text-lg leading-relaxed text-[color:var(--fg)]">
                  &ldquo;{review.content}&rdquo;
                </p>
                {/* 작성자 */}
                <p className="mt-6 text-sm font-semibold text-[color:var(--muted)]">
                  — {review.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 네비게이션 */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe6eb] transition-colors hover:bg-[#dfe6eb]"
              aria-label="이전 리뷰"
            >
              <ChevronLeft className="h-5 w-5 text-[color:var(--fg)]" />
            </button>
            <div className="flex gap-1.5">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? "w-5 bg-[#ce0e2d]"
                      : "w-2 bg-[#dfe6eb]"
                  }`}
                  aria-label={`리뷰 ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe6eb] transition-colors hover:bg-[#dfe6eb]"
              aria-label="다음 리뷰"
            >
              <ChevronRight className="h-5 w-5 text-[color:var(--fg)]" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
