"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { BookOpen, CircleHelp, MousePointerClick, PanelLeft, X } from "lucide-react";
import { Button, LinkButton } from "../ui";
import { useHelp } from "./HelpProvider";
import { ManualArticle } from "./ManualArticle";
import { manualForPath } from "./manual";
import { SIDEBAR_TOUR, localPath, tourForPath } from "./tours";

/**
 * 도움말 패널 — 오른쪽에서 열리는 시트. 이 화면 둘러보기 · 이 화면에서 하는 일(매뉴얼 글) · 전체 매뉴얼 링크.
 * Esc·바깥 클릭으로 닫힘, Tab 은 패널 안에서만 돈다, 닫히면 열기 전 포커스로.
 */
export function HelpPanel({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const pathname = usePathname();
  const { startTour } = useHelp();
  const panel = useRef<HTMLDivElement>(null);
  const tour = tourForPath(pathname);
  const articles = manualForPath(localPath(pathname));

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
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
    <div className="fixed inset-0 z-dialog">
      <div className="absolute inset-0 animate-fade-in bg-[rgb(21_20_20/0.32)] backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] animate-sheet-right flex-col bg-console shadow-[-16px_0_48px_rgb(21_20_20/0.18)]"
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <CircleHelp className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="help-panel-title" className="text-[17px] font-extrabold tracking-[-0.025em] text-ink">
                도움말
              </h2>
              <p className="truncate text-[12.5px] text-muted">{tour ? `지금 화면 · ${tour.title}` : "이 화면 안내와 운영 매뉴얼"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="도움말 닫기"
            className="flex size-9 items-center justify-center rounded-full bg-canvas text-ink-soft transition-colors hover:bg-hairline hover:text-ink"
          >
            <X className="size-4" strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid gap-2">
            {tour && (
              <button
                type="button"
                data-autofocus
                onClick={() => startTour(tour.id)}
                className="group flex items-center gap-3.5 rounded-[20px] bg-ink p-4 text-left text-white transition-transform active:scale-[0.99]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand">
                  <MousePointerClick className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-extrabold">이 화면 둘러보기</span>
                  <span className="block text-[12.5px] text-white/65">{tour.title} 화면을 {tour.steps.length}단계로 짚어 드려요</span>
                </span>
              </button>
            )}
            <button
              type="button"
              {...(tour ? {} : { "data-autofocus": true })}
              onClick={() => startTour(SIDEBAR_TOUR)}
              className="flex items-center gap-3.5 rounded-[20px] bg-canvas p-4 text-left transition-colors hover:bg-hairline/60"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wash text-ink">
                <PanelLeft className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-ink">사이드바 둘러보기</span>
                <span className="block text-[12.5px] text-muted">관리할 사이트 전환 · 메뉴 · 접기(Ctrl+B)</span>
              </span>
            </button>
          </div>

          <h3 className="mb-3 mt-7 px-1 text-[12px] font-bold tracking-[0.02em] text-muted">이 화면에서 하는 일</h3>
          {articles.length > 0 ? (
            <div className="flex flex-col gap-3">
              {articles.map((s) => (
                <div key={s.id} className="surface-card rounded-[20px] bg-canvas p-5">
                  <ManualArticle s={s} locale={locale} compact onNavigate={onClose} />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[20px] bg-canvas p-5 text-[13.5px] leading-[1.6] text-muted">
              이 화면 전용 안내는 아직 없어요. 전체 업무 흐름은 운영 매뉴얼에서 찾아보세요.
            </p>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-3">
          <LinkButton href={`/${locale}/manual`} variant="primary" className="flex-1">
            <BookOpen aria-hidden />
            전체 운영 매뉴얼
          </LinkButton>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
