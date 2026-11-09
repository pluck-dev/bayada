"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 업로드 표지 이미지. 파일이 없거나 깨지면 fallback(자동 표지)을 보인다.
 * 직접 쓰지 말고 CourseMedia 를 쓴다 — 표지 방식(coverMode) 판단이 거기 있다.
 */
export function CourseThumb({ src, fallback, className = "" }: { src: string; fallback: ReactNode; className?: string }) {
  // 옮겨 온 WordPress 이미지 중 일부는 파일이 없어 깨진다 → 실패하면 자동 표지
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // SSR 된 <img> 가 하이드레이션 전에 이미 실패하면 onError 가 오지 않는다 → 마운트 때 한 번 확인
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) return <>{fallback}</>;
  return (
    // 원격 업로드 이미지(WordPress·미디어 서버) — next/image 최적화 대상 아님
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />
  );
}
