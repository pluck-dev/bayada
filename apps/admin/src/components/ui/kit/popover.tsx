"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@bayada/ui";

/**
 * 앵커 아래(공간 없으면 위)에 붙는 떠 있는 패널. body 포털 + fixed 좌표라
 * overflow 가 걸린 카드·표 안에서도 잘리지 않는다. 바깥 클릭·Esc 시 닫히고, 스크롤·리사이즈 땐 따라간다.
 */
export function Popover({
  anchor,
  open,
  onClose,
  children,
  minWidth,
  matchWidth = true,
  maxHeight = 320,
  align = "start",
  className,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
  matchWidth?: boolean;
  maxHeight?: number;
  align?: "start" | "end";
  className?: string;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) {
      setPos(null);
      return;
    }
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const width = Math.max(matchWidth ? r.width : 0, minWidth ?? 0);
      const below = window.innerHeight - r.bottom;
      const up = below < Math.min(maxHeight, 260) + 12 && r.top > below;
      const rawLeft = align === "end" ? r.right - width : r.left;
      const left = Math.min(Math.max(8, rawLeft), window.innerWidth - width - 8);
      setPos({ top: up ? r.top - 6 : r.bottom + 6, left, width, up });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, matchWidth, minWidth, maxHeight, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel?.contains(t) || anchor?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        anchor?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, anchor, panel, onClose]);

  if (typeof document === "undefined" || !open || !pos) return null;
  return createPortal(
    <div
      ref={setPanel}
      style={{
        position: "fixed",
        left: pos.left,
        width: pos.width,
        ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
        transformOrigin: pos.up ? "bottom" : "top",
        zIndex: 90,
      }}
      className={cn(
        "surface-card overflow-hidden rounded-2xl bg-canvas p-1.5 shadow-pop",
        pos.up ? "animate-pop-up" : "animate-pop-in",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
