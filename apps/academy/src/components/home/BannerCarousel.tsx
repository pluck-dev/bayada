"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  linkUrl: string | null;
}

/** 관리자 배너(노출 기간 내)를 히어로 우측 카드로 순환 */
export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  const b = banners[index];
  const body = (
    <div className="relative h-full overflow-hidden rounded-3xl bg-ink">
      {b.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        <p className="text-2xl font-bold leading-snug tracking-tight">{b.title}</p>
        {b.subtitle && <p className="mt-2 text-sm text-white/80">{b.subtitle}</p>}
        {b.linkUrl && (
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
            자세히 보기 <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="flex h-full flex-col gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="min-h-[320px] flex-1" aria-live="polite">
        {b.linkUrl ? (
          <Link href={b.linkUrl} className="block h-full">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-2">
          {banners.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${i + 1}번째 배너`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-ink" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
