"use client";

import { useEffect, useRef, useState } from "react";

export function CourseThumb({
  src,
  title,
  label,
  className = "",
}: {
  src: string | null;
  title: string;
  label?: string | null;
  className?: string;
}) {
  // 옮겨 온 WordPress 이미지 중 일부는 파일이 없어 깨진다 → 실패하면 대체 그래픽
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // SSR 된 <img> 가 하이드레이션 전에 이미 실패하면 onError 가 오지 않는다 → 마운트 때 한 번 확인
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (src && !failed) {
    return (
      // 원격 업로드 이미지(WordPress) — next/image 최적화 대상 아님
      // eslint-disable-next-line @next/next/no-img-element
      <img ref={ref} src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />
    );
  }
  // 대체 그래픽: 색을 늘리지 않고 중립 면 + 주제 이름 (카드 목록이 얼룩덜룩해지지 않게)
  return (
    <div
      aria-hidden
      className={`flex h-full w-full items-end bg-gradient-to-br from-neutral-100 to-neutral-50 p-4 ${className}`}
    >
      <span className="line-clamp-2 text-body-sm font-bold text-ink-soft">{label || title}</span>
    </div>
  );
}
