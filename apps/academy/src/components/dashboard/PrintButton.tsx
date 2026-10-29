"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
    >
      <Printer className="h-4 w-4" aria-hidden /> PDF로 저장 · 인쇄
    </button>
  );
}
