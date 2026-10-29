"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AcceptInviteButton({ token, locale }: { token: string; locale: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "초대를 수락하지 못했어요.");
        return;
      }
      // 헤더·노출 규칙(사내 강의 등)까지 새 소속으로 다시 그리기 위해 전체 이동
      window.location.href = `/${locale}/dashboard`;
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={accept}
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-70"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        초대 수락하고 합류하기
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
