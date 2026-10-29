"use client";

import { useState } from "react";

// 썸네일이 없을 때: 제목 기반으로 고정된 그라데이션 + 주제 첫 글자
const FALLBACKS = [
  "from-rose-100 via-rose-50 to-white text-rose-700",
  "from-zinc-200 via-zinc-100 to-white text-zinc-700",
  "from-sky-100 via-sky-50 to-white text-sky-800",
  "from-amber-100 via-amber-50 to-white text-amber-800",
  "from-emerald-100 via-emerald-50 to-white text-emerald-800",
  "from-violet-100 via-violet-50 to-white text-violet-800",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

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
  if (src && !failed) {
    return (
      // 원격 업로드 이미지(WordPress) — next/image 최적화 대상 아님
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />
    );
  }
  const tone = FALLBACKS[hash(title) % FALLBACKS.length];
  const initial = (label || title).trim().charAt(0);
  return (
    <div
      aria-hidden
      className={`relative flex h-full w-full items-end bg-gradient-to-br p-4 ${tone} ${className}`}
    >
      <span className="text-5xl font-bold tracking-tight opacity-80">{initial}</span>
      <span className="absolute right-4 top-4 h-10 w-10 rounded-full border border-current opacity-15" />
    </div>
  );
}
