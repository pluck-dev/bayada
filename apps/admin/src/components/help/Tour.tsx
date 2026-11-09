"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@bayada/ui";
import { Button } from "../ui";
import { findTourTarget } from "./HelpProvider";
import type { TourStep } from "./tours";

const PAD = 8;
const GAP = 14;

/**
 * 대상이 화면 밖이면 보이게 스크롤 — scrollIntoView 는 조상 전부(페이지까지)를 굴려서
 * 사이드바 안 버튼을 가리킬 때 본문이 엉뚱하게 내려간다. 가장 가까운 스크롤 상자만 먼저 굴리고, 그래도 밖이면 페이지를.
 */
function reveal(el: HTMLElement, saved: Map<Element | Window, number>) {
  const vh = window.innerHeight;
  let box = el.parentElement;
  while (box && box !== document.body) {
    const oy = getComputedStyle(box).overflowY;
    if ((oy === "auto" || oy === "scroll") && box.scrollHeight > box.clientHeight) break;
    box = box.parentElement;
  }
  if (box && box !== document.body) {
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < b.top + 12 || r.bottom > b.bottom - 12) {
      if (!saved.has(box)) saved.set(box, box.scrollTop);
      box.scrollTop += r.top - b.top - Math.max(12, (b.height - r.height) / 2);
    }
  }
  const r = el.getBoundingClientRect();
  if (r.top < 12 || r.bottom > vh - 12) {
    if (!saved.has(window)) saved.set(window, window.scrollY);
    window.scrollBy(0, r.height > vh * 0.6 ? r.top - 24 : r.top - (vh - r.height) / 2);
  }
}

/**
 * 화면 둘러보기 — 대상 요소를 밝게 뚫고(나머지는 어둡게) 옆에 단계 카드를 띄운다.
 * ←/→ 이동, Esc 건너뛰기, Tab 은 카드 안에서만 돈다. 대상이 화면 밖이면 스크롤해서 가운데로.
 */
export function Tour({ title, steps, onFinish }: { title: string; steps: TourStep[]; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [cardH, setCardH] = useState(220);
  const card = useRef<HTMLDivElement>(null);
  // 둘러보기 때문에 굴린 스크롤 — 끝나면 원래 자리로
  const saved = useRef(new Map<Element | Window, number>());
  const step = steps[i];
  const last = i === steps.length - 1;

  const measure = useCallback(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    setRect(step?.target ? (findTourTarget(step.target)?.getBoundingClientRect() ?? null) : null);
  }, [step]);

  // 단계가 바뀌면 대상을 화면 안으로 스크롤 후 위치를 잰다
  useLayoutEffect(() => {
    if (step?.target) {
      const el = findTourTarget(step.target);
      if (el) reveal(el, saved.current);
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure, step]);

  useLayoutEffect(() => {
    if (card.current) setCardH(card.current.offsetHeight);
  }, [i, vp.w]);

  const next = useCallback(() => (last ? onFinish() : setI((n) => n + 1)), [last, onFinish]);
  const prev = useCallback(() => setI((n) => Math.max(0, n - 1)), []);

  // 포커스는 카드 안 '다음' 버튼으로, 닫히면 원래 자리로
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const scrolls = saved.current;
    return () => {
      for (const [box, top] of scrolls) {
        if (box === window) window.scrollTo(0, top);
        else (box as Element).scrollTop = top;
      }
      before?.focus?.({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    requestAnimationFrame(() => card.current?.querySelector<HTMLElement>("[data-tour-next]")?.focus());
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onFinish();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Tab" && card.current) {
        const f = card.current.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!f.length) return;
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (!card.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [next, prev, onFinish]);

  if (!step || typeof document === "undefined" || vp.w === 0) return null;

  // 카드 위치: 대상 오른쪽(사이드바처럼 좁고 긴 대상) → 아래 → 위 → 화면 오른쪽 아래 구석
  const W = Math.min(352, vp.w - 24);
  let pos: React.CSSProperties = { left: (vp.w - W) / 2, top: Math.max(12, (vp.h - cardH) / 2) };
  if (rect) {
    const clampX = (x: number) => Math.min(Math.max(12, x), vp.w - W - 12);
    const clampY = (y: number) => Math.min(Math.max(12, y), vp.h - cardH - 12);
    if (rect.right + PAD + GAP + W < vp.w - 12 && rect.width < vp.w / 3) pos = { left: rect.right + PAD + GAP, top: clampY(rect.top - PAD) };
    else if (rect.bottom + PAD + GAP + cardH < vp.h - 12) pos = { left: clampX(rect.left - PAD), top: rect.bottom + PAD + GAP };
    else if (rect.top - PAD - GAP - cardH > 12) pos = { left: clampX(rect.left - PAD), top: rect.top - PAD - GAP - cardH };
    else if (rect.left - PAD - GAP - W > 12) pos = { left: rect.left - PAD - GAP - W, top: clampY(rect.top - PAD) };
    else pos = { left: vp.w - W - 20, top: vp.h - cardH - 20 };
  }

  return createPortal(
    <div className="fixed inset-0 z-toast" role="dialog" aria-modal="true" aria-label={`${title} 둘러보기`}>
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[18px] transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          // 바깥 어둡게 = 큰 그림자, 테두리 = 흰 2px + 레드 번짐
          style={{
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 2px rgb(255 255 255 / 0.95), 0 0 0 7px rgb(227 27 52 / 0.35), 0 0 0 9999px rgb(21 20 20 / 0.58)",
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 animate-fade-in bg-[rgb(21_20_20/0.58)] backdrop-blur-[2px]" />
      )}
      <div
        ref={card}
        key={i}
        className="surface-card absolute animate-pop-in rounded-[22px] bg-canvas p-5 shadow-pop"
        style={{ ...pos, width: W }}
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[12px] font-bold text-muted">
            <span className="rounded-full bg-pill-brand px-2 py-0.5 text-brand-700">{title}</span>
            <span className="num">
              {i + 1} / {steps.length}
            </span>
          </span>
          <button
            type="button"
            onClick={onFinish}
            aria-label="둘러보기 닫기"
            className="-mr-1.5 flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-ink"
          >
            <X className="size-4" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
        <h3 className="mt-2 text-[17px] font-extrabold leading-[1.4] tracking-[-0.025em] text-ink">{step.title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-[1.65] text-ink-soft">{step.body}</p>
        <div className="mt-4 flex items-center gap-1" aria-hidden>
          {steps.map((_, n) => (
            <span key={n} className={cn("h-1.5 rounded-full transition-all duration-300", n === i ? "w-5 bg-brand" : n < i ? "w-1.5 bg-ink/40" : "w-1.5 bg-hairline")} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          {last ? (
            <span />
          ) : (
            <Button variant="ghost" size="sm" onClick={onFinish}>
              건너뛰기
            </Button>
          )}
          <div className="flex gap-1.5">
            {i > 0 && (
              <Button variant="secondary" size="sm" onClick={prev}>
                이전
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={next} data-tour-next>
              {last ? "완료" : "다음"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
