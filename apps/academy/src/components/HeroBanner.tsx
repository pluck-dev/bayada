"use client";

import { Button, cn } from "@bayada/ui";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  ctaText: string;
  ctaLink: string;
  image?: string; // We'll use CSS gradients if no image
  gradient: string;
  textColor: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    title: "성장을 위한\n가장 확실한 시작",
    subtitle: "프리미엄 교육 플랫폼 BAYADA",
    description: "검증된 전문가들과 함께하는 실무 중심의 커리큘럼.\n지금 바로 당신의 커리어를 한 단계 높여보세요.",
    tags: ["신규가입 혜택", "무제한 수강"],
    ctaText: "무료로 시작하기",
    ctaLink: "/auth/register",
    gradient: "from-violet-600 via-purple-500 to-indigo-500", // Similar to reference purple
    textColor: "text-white",
  },
  {
    id: 2,
    title: "2025년 최신\n간호 실무 트렌드",
    subtitle: "현장 전문가가 전하는 노하우",
    description: "변화하는 의료 환경에 발맞춘 최신 가이드라인.\n놓치지 말아야 할 핵심 포인트를 짚어드립니다.",
    tags: ["인기 강의", "트렌드 특강"],
    ctaText: "강의 보러가기",
    ctaLink: "/courses",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    textColor: "text-white",
  },
  {
    id: 3,
    title: "BAYADA 멤버십\n오픈 기념 특가",
    subtitle: "지금 가입하면 최대 50% 할인",
    description: "모든 강의를 제한 없이 수강할 수 있는 멤버십.\n런칭 기념 특별 할인가로 만나보세요.",
    tags: ["이벤트", "기간한정"],
    ctaText: "멤버십 알아보기",
    ctaLink: "/pricing",
    gradient: "from-blue-600 via-blue-500 to-sky-500",
    textColor: "text-white",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={cn(
                "relative min-w-full flex-shrink-0 px-8 py-16 sm:px-16 sm:py-24 md:py-32 bg-gradient-to-r",
                slide.gradient
              )}
            >
              {/* Background Decoration (Abstract) */}
              <div className="absolute inset-0 opacity-10">
                 <div className="absolute -right-20 -top-20 h-[30rem] w-[30rem] rounded-full bg-white blur-3xl" />
                 <div className="absolute -left-20 -bottom-20 h-[20rem] w-[20rem] rounded-full bg-black blur-3xl opacity-50" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                {/* Text Content */}
                <div className="max-w-2xl space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {slide.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md",
                          "bg-white/20 text-white"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-4">
                     <p className={cn("font-medium opacity-90", slide.textColor)}>{slide.subtitle}</p>
                     <h2 className={cn("text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl whitespace-pre-line", slide.textColor)}>
                       {slide.title}
                     </h2>
                     <p className={cn("text-lg leading-relaxed opacity-80 whitespace-pre-line hidden sm:block", slide.textColor)}>
                       {slide.description}
                     </p>
                  </div>

                  <div className="pt-4">
                    <Link href={slide.ctaLink}>
                      <Button
                        size="lg"
                        className="rounded-full bg-white text-gray-900 border-none hover:bg-gray-100 font-bold px-8 h-14 text-base shadow-lg hover:scale-105 transition-transform"
                      >
                        {slide.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Side / Image Placeholder */}
                {/* In a real scenario, this would be an Image component. Keeping it abstract for now to match the pure CSS gradient feel or adding a simple graphic. */}
                <div className="hidden lg:block relative w-1/3 aspect-square">
                   {/* We could add an illustration here if desired. For now, empty or subtle decoration. */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls Overlay */}
        <div className="absolute bottom-8 left-8 sm:left-16 flex items-center gap-4 z-20">
           {/* Pagination Pill */}
           <div className="flex items-center gap-3 rounded-full bg-black/20 backdrop-blur-md px-4 py-2 text-sm font-medium text-white border border-white/10">
              <span>{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="opacity-50">/</span>
              <span className="opacity-50">{String(slides.length).padStart(2, '0')}</span>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
              </button>
           </div>

           <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Right Arrow (Alternative placement if desired, but sticking to bottom left/right as per typical pattern) */}
      </div>
    </div>
  );
}
