"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** 수료증 검증 링크 복사 */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("검증 링크를 복사하세요", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:border-ink"
    >
      {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      {copied ? "복사했어요" : "검증 링크"}
    </button>
  );
}
