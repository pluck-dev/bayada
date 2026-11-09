"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * 화면 가장자리에서 밀려 나오는 패널 — 모바일 메뉴 서랍(side="right"), 필터 바텀시트(side="bottom").
 * <dialog>.showModal() 기반이라 포커스 가두기·Esc·배경 비활성은 브라우저가 처리. 열리면 본문 스크롤을 잠근다.
 * 머리줄(제목 + 닫기) / 본문(스크롤) / 바닥(행동) 구조.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "bottom",
  className,
  "aria-label": ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "bottom" | "right";
  className?: string;
  "aria-label"?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none border-0 bg-canvas p-0 text-ink shadow-lg backdrop:bg-ink/45",
        side === "bottom"
          ? "top-auto bottom-0 left-0 h-auto max-h-[88dvh] w-full rounded-t-[22px] open:animate-sheet-up"
          : "left-auto right-0 top-0 h-dvh w-[min(88vw,380px)] open:animate-sheet-right",
        className,
      )}
    >
      {open && (
        <div className={cn("flex flex-col", side === "bottom" ? "max-h-[88dvh]" : "h-dvh")}>
          {side === "bottom" && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />}
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-2 pt-3">
            {title ? (
              <h2 id={titleId} className="text-h3 text-ink">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
                <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
          {footer && (
            <div className="flex shrink-0 gap-2 border-t border-line px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
