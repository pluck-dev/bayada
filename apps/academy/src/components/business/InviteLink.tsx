"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/** 초대 링크 표시 + 복사. 주소는 지금 보고 있는 사이트 기준 (메일 발송 대신 관리자가 직접 전달) */
export function InviteLink({ path, compact = false }: { path: string; compact?: boolean }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${path}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("초대 링크를 복사하세요", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {!compact && (
        <code className="min-w-0 flex-1 truncate rounded-lg bg-surface px-3 py-2 font-mono text-xs text-ink-soft ring-1 ring-line">
          {url}
        </code>
      )}
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-ink"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        {copied ? "복사했어요" : "링크 복사"}
      </button>
    </div>
  );
}
