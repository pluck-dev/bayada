"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@bayada/ui";

/**
 * 대화상자 — 네이티브 <dialog> 대신 포털 + 흐린 배경. Esc·배경 클릭으로 닫힘, Tab 은 안에서만 돈다,
 * 열려 있는 동안 페이지 스크롤 잠금, 닫히면 열기 전 포커스로 돌아간다.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "sm",
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideClose?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const auto = panel.current?.querySelector<HTMLElement>("[data-autofocus], [autofocus]");
      (auto ?? panel.current)?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([type=hidden]):not([tabindex="-1"]), textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-dialog flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-[rgb(21_20_20/0.42)] backdrop-blur-[3px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-t`}
        aria-describedby={description ? `${uid}-d` : undefined}
        tabIndex={-1}
        className={cn(
          "surface-card relative w-full animate-sheet-in rounded-[24px] bg-canvas p-7 shadow-pop outline-none",
          size === "sm" ? "max-w-[460px]" : size === "md" ? "max-w-[600px]" : "max-w-[820px]",
        )}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-wash text-ink-soft transition-colors hover:bg-wash-strong hover:text-ink"
          >
            <X className="size-4" strokeWidth={2.4} aria-hidden />
          </button>
        )}
        <h2 id={`${uid}-t`} className="pr-10 text-[20px] font-extrabold leading-[1.35] tracking-[-0.025em] text-ink">
          {title}
        </h2>
        {description && (
          <div id={`${uid}-d`} className="mt-1.5 whitespace-pre-line text-[14px] leading-[1.6] text-muted">
            {description}
          </div>
        )}
        {children && <div className="mt-5">{children}</div>}
        {footer && <div className="mt-7 flex gap-2 [&>*]:flex-1">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
