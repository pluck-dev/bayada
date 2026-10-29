"use client";

import { RotateCw } from "lucide-react";

export default function CatalogError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-20">
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <p className="text-base font-semibold text-ink">프로그램을 불러오지 못했어요</p>
        <p className="mt-2 text-sm text-muted">잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
        >
          <RotateCw className="h-4 w-4" aria-hidden /> 다시 시도
        </button>
      </div>
    </div>
  );
}
