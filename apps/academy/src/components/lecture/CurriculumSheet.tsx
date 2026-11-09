"use client";

import { useState } from "react";
import { ListOrdered } from "lucide-react";
import { Sheet } from "@bayada/ui";

/** 모바일·태블릿 강의실: 커리큘럼을 바텀시트로. 목록(서버에서 그린 것)은 children 으로 받는다 */
export function CurriculumSheet({ count, done, children }: { count: number; done: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface-sunken px-3.5 text-caption font-bold text-ink transition-colors hover:bg-neutral-200 lg:hidden"
      >
        <ListOrdered className="h-4 w-4" aria-hidden />
        커리큘럼 <span className="tabular font-semibold text-muted">{done}/{count}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="커리큘럼">
        {/* 강의를 누르면 페이지가 바뀌며 시트가 닫힌다(링크 이동) */}
        <div onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>{children}</div>
      </Sheet>
    </>
  );
}
