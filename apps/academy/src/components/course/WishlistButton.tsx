"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";

/**
 * 찜 토글. wished === null 이면 비로그인 → 로그인 후 지금 페이지로 돌아온다.
 * variant: card(썸네일 위 원형) / panel(수강 패널 버튼)
 */
export function WishlistButton({
  courseId,
  locale,
  wished: initial,
  variant = "card",
  className = "",
}: {
  courseId: string;
  locale: string;
  wished: boolean | null;
  variant?: "card" | "panel";
  className?: string;
}) {
  const router = useRouter();
  const [wished, setWished] = useState(!!initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (initial === null) {
      const here = `${window.location.pathname}${window.location.search}`;
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(here)}`);
      return;
    }
    if (busy) return;
    const next = !wished;
    setWished(next); // 낙관적 반영, 실패하면 되돌린다
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/wishlist/${encodeURIComponent(courseId)}`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) setWished(!next);
      else router.refresh();
    } catch {
      setWished(!next);
    } finally {
      setBusy(false);
    }
  }

  const label = wished ? "찜 해제" : "찜하기";

  if (variant === "panel") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={wished}
        aria-label={label}
        className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors ${
          wished ? "border-brand/30 bg-brand-soft text-brand" : "border-line text-ink hover:border-ink"
        } ${className}`}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} aria-hidden />
        {wished ? "찜함" : "찜하기"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={wished}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card ring-1 ring-black/5 backdrop-blur transition-transform hover:scale-105 ${
        wished ? "text-brand" : "text-ink-soft hover:text-ink"
      } ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] ${wished ? "fill-current" : ""}`} aria-hidden />
    </button>
  );
}
