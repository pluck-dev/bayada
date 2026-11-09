"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@bayada/ui";

/** 네이티브 <details>/<summary> 대체 — 높이가 부드럽게 열리는 접이식 영역 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-3 rounded-xl py-2 text-left text-[13.5px] font-bold text-ink-soft outline-none transition-colors hover:text-ink"
      >
        <span className="min-w-0">{summary}</span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full bg-wash transition-[transform,background-color] duration-200 group-hover:bg-wash-strong",
            open && "rotate-45 bg-ink text-white group-hover:bg-ink",
          )}
        >
          <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
      </button>
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className="pb-1 pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
