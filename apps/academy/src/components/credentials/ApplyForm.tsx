"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const MAX = 2000;

/** 바야다 인증 신청 — 신청 동기 + 신청 버튼. 자격이 없으면 사유와 함께 비활성 */
export function ApplyForm({
  slug,
  locale,
  loggedIn,
  canApply,
  reason,
  renewal,
}: {
  slug: string;
  locale: string;
  loggedIn: boolean;
  canApply: boolean;
  reason?: string;
  renewal?: boolean;
}) {
  const router = useRouter();
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loggedIn) {
    const here = `/${locale}/certifications/${encodeURIComponent(slug)}`;
    return (
      <button
        type="button"
        onClick={() => router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(here)}`)}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-ink text-[15px] font-semibold text-white hover:bg-ink-soft"
      >
        로그인 후 신청
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/certifications/${encodeURIComponent(slug)}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivation }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "신청하지 못했어요. 잠시 후 다시 시도해 주세요.");
      } else {
        setMotivation("");
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {canApply && (
        <label className="block">
          <span className="text-sm font-semibold text-ink">
            신청 동기 <span className="font-normal text-muted">(선택)</span>
          </span>
          <textarea
            rows={4}
            maxLength={MAX}
            disabled={busy}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="현재 하고 있는 일, 인증을 받으려는 이유를 적어 주세요. 심사위원이 참고해요."
            className="mt-2 w-full resize-none rounded-xl border border-line px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-subtle focus:border-ink focus:outline-none disabled:bg-surface disabled:text-subtle"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={!canApply || busy}
        title={!canApply ? reason : undefined}
        className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[15px] font-semibold text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-subtle"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {renewal ? "갱신 신청하기" : "인증 신청하기"}
      </button>
      {!canApply && reason && <p className="text-center text-xs text-muted">{reason}</p>}
      {error && (
        <p role="alert" className="text-center text-xs text-brand">
          {error}
        </p>
      )}
    </form>
  );
}
