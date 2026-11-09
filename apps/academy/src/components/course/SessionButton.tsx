"use client";

import { buttonVariants, useFeedback } from "@bayada/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/** 실습 일정 신청·취소. canApply=false 면 사유(reason)를 툴팁·보조문구로 보여 준다 */
export function SessionButton({
  sessionId,
  registered,
  full,
  loggedIn,
  canApply,
  reason,
  locale,
}: {
  sessionId: string;
  registered: boolean;
  full: boolean;
  loggedIn: boolean;
  canApply: boolean;
  reason?: string;
  locale: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm } = useFeedback();

  async function submit() {
    if (!loggedIn) {
      const here = `${window.location.pathname}${window.location.search}#sessions`;
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(here)}`);
      return;
    }
    if (
      registered &&
      !(await confirm({ title: "실습 신청을 취소할까요?", body: "취소한 자리는 다른 분이 신청할 수 있어요.", confirmLabel: "신청 취소", cancelLabel: "유지", danger: true }))
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/sessions/${encodeURIComponent(sessionId)}/registration`, {
        method: registered ? "DELETE" : "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  const base = buttonVariants({ variant: "secondary", size: "sm" }) + " min-w-[88px]";
  let button;
  if (registered) {
    button = (
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className={base}
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        신청 취소
      </button>
    );
  } else if (full) {
    button = (
      <span className={base} aria-disabled>
        마감
      </span>
    );
  } else if (loggedIn && !canApply) {
    button = (
      <span className={base} aria-disabled>
        신청
      </span>
    );
  } else {
    button = (
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className={base}
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {loggedIn ? "신청" : "로그인 후 신청"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {button}
      {!registered && !full && loggedIn && !canApply && reason && <p className="max-w-[160px] text-right text-caption text-muted">{reason}</p>}
      {error && (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
