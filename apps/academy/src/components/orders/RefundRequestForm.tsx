"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** 환불 요청 — 접수만 하고 실제 환불은 운영자가 처리한다 */
export function RefundRequestForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">환불 규정에 따라 운영팀이 확인 후 환불해 드려요.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:border-ink"
        >
          환불 요청
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "요청을 접수하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="refund-reason" className="text-sm font-semibold text-ink">
        환불 사유
      </label>
      <textarea
        id="refund-reason"
        required
        minLength={2}
        maxLength={500}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="예) 수강 일정이 맞지 않아요"
        className="mt-2 w-full rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-ink focus:outline-none"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand">
          {error}
        </p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 rounded-xl px-4 text-sm font-semibold text-muted hover:text-ink"
        >
          닫기
        </button>
        <button
          type="submit"
          disabled={loading || reason.trim().length < 2}
          className="flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          환불 요청하기
        </button>
      </div>
    </form>
  );
}
