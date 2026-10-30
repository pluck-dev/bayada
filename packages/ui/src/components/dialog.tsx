"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * 네이티브 <dialog> 기반 모달 — 포커스 가두기·Esc·배경 클릭 닫기·스크롤 잠금을 브라우저가 처리.
 * 머리글(제목+설명) / 본문 / 바닥(행동, 오른쪽 정렬: 취소 → 주요) 구조.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** false 면 Esc·배경 클릭으로 닫히지 않는다 (진행 중 작업) */
  dismissible?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-0 bg-canvas p-0 text-ink shadow-lg",
        size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-h3 text-ink">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1.5 text-body-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="-mr-2 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-sunken hover:text-ink"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z" />
                </svg>
              </button>
            )}
          </div>
          {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>}
          {footer && <div className="flex flex-wrap justify-end gap-2 px-6 pb-6 pt-2">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
