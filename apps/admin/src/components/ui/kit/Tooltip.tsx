"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@bayada/ui";

/**
 * 네이티브 title 툴팁 대체.
 * - 요소에 `data-tip="설명"` 만 달면 된다(서버 컴포넌트에서도). TooltipLayer 가 화면에 하나 떠서 그린다.
 * - 비활성 버튼처럼 이벤트를 못 받는 요소는 <Tooltip content> 로 감싼다(감싼 span 이 대신 받는다).
 * - 안전장치: 혹시 남은 title 속성은 hover 순간 data-tip 으로 옮겨 브라우저 툴팁이 뜨지 않게 한다.
 * - `data-tip-side="right"` = 요소 오른쪽에 띄운다(접힌 사이드바 아이콘처럼 위아래가 빽빽한 곳).
 * - `data-tip-kbd="Ctrl B"` = 말풍선 끝에 단축키 칩(공백으로 키 구분).
 */
export function Tooltip({ content, children, className }: { content?: React.ReactNode; children: React.ReactNode; className?: string }) {
  if (!content && !className) return <>{children}</>;
  return (
    <span data-tip={typeof content === "string" ? content : undefined} className={cn("inline-flex [&>button:disabled]:pointer-events-none", className)}>
      {children}
    </span>
  );
}

type Tip = { text: string; kbd: string[]; x: number; y: number; side: "top" | "bottom" | "right" };

export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const find = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return null;
      const titled = t.closest<HTMLElement>("[title]:not(svg *):not(svg)");
      if (titled && titled.getAttribute("title")) {
        titled.setAttribute("data-tip", titled.getAttribute("title")!);
        titled.removeAttribute("title");
      }
      return t.closest<HTMLElement>("[data-tip]");
    };
    const show = (el: HTMLElement) => {
      const text = el.getAttribute("data-tip");
      if (!text) return;
      const r = el.getBoundingClientRect();
      const kbd = (el.getAttribute("data-tip-kbd") ?? "").split(" ").filter(Boolean);
      if (el.getAttribute("data-tip-side") === "right") {
        setTip({ text, kbd, x: r.right + 10, y: r.top + r.height / 2, side: "right" });
        return;
      }
      const below = r.top < 56;
      setTip({ text, kbd, x: r.left + r.width / 2, y: below ? r.bottom + 8 : r.top - 8, side: below ? "bottom" : "top" });
    };
    const enter = (e: Event) => {
      const el = find(e.target);
      if (el === current) return;
      current = el;
      clearTimeout(timer);
      if (!el) return setTip(null);
      timer = setTimeout(() => show(el), e.type === "focusin" ? 0 : 280);
    };
    const hide = () => {
      clearTimeout(timer);
      current = null;
      setTip(null);
    };
    const leave = (e: PointerEvent) => {
      if (!current) return;
      const to = e.relatedTarget as Node | null;
      if (to && current.contains(to)) return;
      hide();
    };
    document.addEventListener("pointerover", enter, true);
    // 스크롤로 닫힌 뒤 포인터가 같은 요소 위에 머물면 pointerover 가 다시 오지 않는다 → 움직이면 다시 띄운다
    document.addEventListener("pointermove", enter, true);
    document.addEventListener("focusin", enter, true);
    document.addEventListener("pointerout", leave, true);
    document.addEventListener("focusout", hide, true);
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("scroll", hide, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerover", enter, true);
      document.removeEventListener("pointermove", enter, true);
      document.removeEventListener("focusin", enter, true);
      document.removeEventListener("pointerout", leave, true);
      document.removeEventListener("focusout", hide, true);
      document.removeEventListener("pointerdown", hide, true);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  if (!tip || typeof document === "undefined") return null;
  const right = tip.side === "right";
  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: right ? tip.x : Math.min(Math.max(tip.x, 160), window.innerWidth - 160),
        top: tip.y,
        transform: right ? "translate(0, -50%)" : `translate(-50%, ${tip.side === "bottom" ? "0" : "-100%"})`,
        zIndex: 100,
      }}
      className="pointer-events-none"
    >
      <div
        className={cn(
          "flex max-w-[300px] items-center gap-2 rounded-xl bg-ink px-3 py-2 text-[12.5px] font-medium leading-[1.5] whitespace-pre-line text-white shadow-float",
          right ? "animate-fade-in" : tip.side === "bottom" ? "animate-pop-in" : "animate-pop-up",
        )}
      >
        <span>{tip.text}</span>
        {tip.kbd.length > 0 && (
          <span className="flex shrink-0 gap-0.5">
            {tip.kbd.map((k) => (
              <kbd key={k} className="rounded-md bg-white/14 px-1.5 py-px font-sans text-[11px] font-bold text-white/85">
                {k}
              </kbd>
            ))}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}
