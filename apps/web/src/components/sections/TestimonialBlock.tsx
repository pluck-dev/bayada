"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@bayada/ui";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

interface TestimonialBlockProps {
  title?: string;
  testimonials: Testimonial[];
  variant?: "single" | "grid" | "carousel";
}

const ease = [0.16, 1, 0.3, 1] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {testimonial.rating && (
        <div className="mb-3">
          <StarRating rating={testimonial.rating} />
        </div>
      )}
      <p className="flex-1 text-sm leading-relaxed text-black/[0.7]">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-black/[0.87]">
          {testimonial.author}
        </p>
        {testimonial.role && (
          <p className="text-xs text-black/50">{testimonial.role}</p>
        )}
      </div>
    </div>
  );
}

function SingleTestimonial({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="mx-auto max-w-3xl text-center"
    >
      <Quote className="mx-auto mb-6 h-10 w-10 text-[#ce0e2d]/20" />
      {testimonial.rating && (
        <div className="mb-4 flex justify-center">
          <StarRating rating={testimonial.rating} />
        </div>
      )}
      <blockquote
        className="text-xl font-medium leading-relaxed text-black/[0.87] lg:text-2xl"
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="mt-6">
        <p className="text-base font-semibold text-black/[0.87]">
          {testimonial.author}
        </p>
        {testimonial.role && (
          <p className="mt-1 text-sm text-black/50">{testimonial.role}</p>
        )}
      </div>
    </motion.div>
  );
}

function GridTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.author}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: index * 0.08, ease }}
        >
          <TestimonialCard testimonial={testimonial} />
        </motion.div>
      ))}
    </div>
  );
}

function CarouselTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* 네비게이션 버튼 */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-black/60 transition-colors hover:bg-gray-50 disabled:opacity-30"
          aria-label="이전"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-black/60 transition-colors hover:bg-gray-50 disabled:opacity-30"
          aria-label="다음"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 캐러셀 */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto"
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.author}
            className="w-[320px] shrink-0 snap-start sm:w-[380px]"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialBlock({
  title,
  testimonials,
  variant = "grid",
}: TestimonialBlockProps) {
  return (
    <section className="bg-[#f0f4f7] py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h2>
        )}

        {variant === "single" && testimonials[0] && (
          <SingleTestimonial testimonial={testimonials[0]} />
        )}
        {variant === "grid" && <GridTestimonials testimonials={testimonials} />}
        {variant === "carousel" && (
          <CarouselTestimonials testimonials={testimonials} />
        )}
      </div>
    </section>
  );
}
