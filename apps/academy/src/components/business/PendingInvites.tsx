"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/labels";
import { InviteLink } from "./InviteLink";

/** 대기 중인 초대 목록: 링크 복사 · 초대 취소 */
export function PendingInvites({
  locale,
  invites,
}: {
  locale: string;
  invites: { id: string; email: string; token: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function revoke(id: string, email: string) {
    if (!window.confirm(`${email} 초대를 취소할까요? 보낸 링크는 더 이상 쓸 수 없어요.`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/v1/business/invites/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) window.alert("초대를 취소하지 못했어요.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-white">
      {invites.map((i) => (
        <li key={i.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{i.email}</p>
            <p className="text-xs text-muted">{formatDate(i.createdAt)} 초대 · 수락 대기</p>
          </div>
          <div className="flex items-center gap-2">
            <InviteLink path={`/${locale}/invite/${i.token}`} compact />
            <button
              type="button"
              onClick={() => revoke(i.id, i.email)}
              disabled={busy === i.id}
              className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-muted hover:bg-brand-soft hover:text-brand disabled:opacity-60"
            >
              초대 취소
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
