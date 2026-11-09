"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag } from "lucide-react";
import { useFeedback } from "@bayada/ui";

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
  const { confirm, toast } = useFeedback();

  async function report() {
    if (!loggedIn) {
      const here = `${window.location.pathname}${window.location.search}#reviews`;
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(here)}`);
      return;
    }
    const ok = await confirm({
      title: "이 후기를 신고할까요?",
      body: "부적절한 내용으로 신고하면 운영팀이 검토해요. 신고는 한 번만 할 수 있어요.",
      confirmLabel: "신고하기",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/reviews/${encodeURIComponent(reviewId)}/report`, { method: "POST" });
      if (res.ok || res.status === 409) {
        setReported(true);
        toast("success", "신고를 접수했어요. 운영팀이 검토할게요.");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast("error", data.error ?? "신고하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } catch {
      toast("error", "네트워크 오류로 신고하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (reported) return <span className="text-caption text-subtle">신고됨</span>;
  return (
    <button
      type="button"
      onClick={report}
      disabled={busy}
      className="inline-flex items-center gap-1 text-caption text-subtle transition-colors hover:text-ink-soft disabled:opacity-60"
    >
      <Flag className="h-3 w-3" aria-hidden /> 신고
    </button>
  );
}
