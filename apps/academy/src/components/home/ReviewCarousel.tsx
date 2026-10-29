"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** 홈 ⑩ 후기 가로 캐러셀 (스크롤 스냅 + 이전/다음 버튼). 카드는 서버에서 렌더해 넘긴다 */
export function ReviewCarousel({ children, count }: { children: ReactNode; count: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: count <= 3 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const move = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line";

  return (
    <div>
      <div
        ref={track}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 lg:mx-0 lg:gap-5 lg:px-0"
        aria-roledescription="carousel"
        aria-label="수강 후기"
      >
        {children}
      </div>
      {!(edge.start && edge.end) && (
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="이전 후기" className={btn}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label="다음 후기" className={btn}>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
