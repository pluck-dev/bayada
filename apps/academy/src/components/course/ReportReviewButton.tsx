"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag } from "lucide-react";

/** 후기 신고 (사용자당 1회, 서버에서 중복 거절) */
export function ReportReviewButton({
  reviewId,
  reported: initial,
  loggedIn,
  locale,
}: {
  reviewId: string;
  reported: boolean;
  loggedIn: boolean;
  locale: string;
}) {
  const router = useRouter();
  const [reported, setReported] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function report() {
    if (!loggedIn) {
      const here = `${window.location.pathname}${window.location.search}#reviews`;
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(here)}`);
      return;
    }
    if (!window.confirm("이 후기를 부적절한 내용으로 신고할까요? 운영팀이 검토해요.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/reviews/${encodeURIComponent(reviewId)}/report`, { method: "POST" });
      if (res.ok || res.status === 409) setReported(true);
      else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error ?? "신고하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (reported) return <span className="text-xs text-subtle">신고됨</span>;
  return (
    <button
      type="button"
      onClick={report}
      disabled={busy}
      className="inline-flex items-center gap-1 text-xs text-subtle transition-colors hover:text-ink-soft disabled:opacity-60"
    >
      <Flag className="h-3 w-3" aria-hidden /> 신고
    </button>
  );
}
