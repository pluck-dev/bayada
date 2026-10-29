"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** 네이티브 <dialog> 모달 (포커스 가두기·Esc 닫기는 브라우저 기본 동작) */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[calc(100vh-48px)] w-[calc(100%-32px)] overflow-hidden rounded-3xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] ${
        wide ? "max-w-3xl" : "max-w-lg"
      }`}
    >
      {open && (
        <div className="flex max-h-[calc(100vh-48px)] flex-col">
          <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-line-soft hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
