"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Flag } from "lucide-react";

/** 목표로 설정 토글. isGoal === null 이면 비로그인 → 로그인 후 지금 페이지로 돌아온다 */
export function GoalButton({ pathwayId, locale, isGoal: initial }: { pathwayId: string; locale: string; isGoal: boolean | null }) {
  const router = useRouter();
  const [goal, setGoal] = useState(!!initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (initial === null) {
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;
    const next = !goal;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/pathways/${encodeURIComponent(pathwayId)}/goal`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "잠시 후 다시 시도해 주세요.");
        return;
      }
      setGoal(next);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={goal}
        title={goal ? "목표 해제" : undefined}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-body font-semibold transition-colors disabled:opacity-60 ${
          goal
            ? "border border-success/30 bg-success-soft text-success hover:border-success"
            : "bg-brand text-white shadow-[0_8px_20px_-8px_rgb(227_27_52/0.6)] hover:bg-brand-strong"
        }`}
      >
        {goal ? <Check className="h-4 w-4" aria-hidden /> : <Flag className="h-4 w-4" aria-hidden />}
        {goal ? "내 커리어 목표" : "목표로 설정"}
      </button>
      {goal && (
        <Link href={`/${locale}/dashboard/goals`} className="text-body-sm font-semibold text-ink-soft hover:text-ink">
          마이 러닝에서 진행 상황 보기 →
        </Link>
      )}
      {error && (
        <p role="alert" className="w-full text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
