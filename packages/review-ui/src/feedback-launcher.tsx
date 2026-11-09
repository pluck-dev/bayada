"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Monitor01, List, Eye, CheckCircle, Plus, ArrowUpRight, LogOut01 } from "@untitledui/icons";
import { feedbackKinds, type FeedbackKind } from "@bayada/review/config";
import { Button } from "./ui";
import type { FeedbackScope } from "./feedback-list";
import { ViewMode } from "./view-mode";

// 375px 화면에서도 겹치지 않게 바깥 라벨을 세로로 벌려 둔다.
const positions = [{ x: -200, y: 0 }, { x: -190, y: -76 }, { x: -150, y: -152 }, { x: -106, y: -228 }, { x: 0, y: -260 }];
const symbols = ["✦", "↗", "!", "T", "···"];

export function FeedbackLauncher({ inspecting, selected, onInspect, onSelect, onList, showingReviews, onToggleReviews, showingResolved, onToggleResolved, onExit }: {
  inspecting: boolean; selected: FeedbackKind | null;
  showingReviews: boolean; onToggleReviews: () => void; onList: (scope: FeedbackScope) => void;
  showingResolved: boolean; onToggleResolved: () => void;
  onInspect: () => void; onSelect: (kind: FeedbackKind) => void; onExit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [choosingKind, setChoosingKind] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const choose = (index: number) => {
    onSelect(feedbackKinds[index].value);
    setOpen(false); setHovered(null); gesture.current = null;
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); setHovered(null); gesture.current = null; };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { close(); trigger.current?.focus(); } };
    window.addEventListener("keydown", key);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("blur", close); window.removeEventListener("resize", close); };
  }, [open]);
  const direction = (x: number, y: number) => {
    const rect = trigger.current!.getBoundingClientRect();
    const dx = x - rect.left - rect.width / 2, dy = y - rect.top - rect.height / 2;
    const distance = Math.hypot(dx, dy);
    if (distance < 48 || distance > 290 || dx > 45 || dy > 45) return null;
    const distances = positions.map(point => Math.hypot(dx - point.x, dy - point.y));
    return distances.indexOf(Math.min(...distances));
  };
  return <>
    {open && <div data-element-inspector className="feedback-wheel-backdrop" onPointerDown={() => setOpen(false)} />}
    <div data-element-inspector className="foundation-theme feedback-tools" data-open={open}>
      <Button variant="secondary" shape="full" className="feedback-inspect" aria-label={inspecting ? "영역 검사 끄기" : "영역 검사 켜기"} aria-pressed={inspecting} onClick={onInspect}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M9 8l3 10 2-4 4-2-9-4Z" /></svg>
        영역 검사
      </Button>
      <ViewMode onOpen={() => { setOpen(false);setChoosingKind(false); }} />
      <div className="feedback-wheel-anchor">
        {open && !choosingKind && <div id="feedback-review-menu" className="feedback-quick-menu" role="group" aria-label="리뷰 피드백 메뉴">
          <div className="feedback-quick-links">
            <Button variant="unstyled" className="feedback-quick-card type-label-3" aria-label="현재 화면 피드백" onClick={() => { setOpen(false); onList("page"); }}><span className="feedback-quick-card-top"><Monitor01 size={22} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={14} aria-hidden="true" /></span><span>현재 화면<span className="feedback-quick-caption type-caption-1">이 페이지의 피드백</span></span></Button>
            <Button variant="unstyled" className="feedback-quick-card type-label-3" aria-label="전체 피드백" onClick={() => { setOpen(false); onList("all"); }}><span className="feedback-quick-card-top"><List size={22} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={14} aria-hidden="true" /></span><span>전체 피드백<span className="feedback-quick-caption type-caption-1">모든 페이지 한눈에</span></span></Button>
          </div>
          <Button variant="unstyled" className="feedback-quick-visibility type-label-3" aria-label={showingReviews ? "화면 피드백 표시 끄기" : "화면에 피드백 표시"} aria-pressed={showingReviews} onClick={onToggleReviews}><Eye size={18} strokeWidth={1.5} aria-hidden="true" /><span>화면에 표시</span><span className="feedback-quick-switch" aria-hidden="true"><span /></span></Button>
          <Button variant="unstyled" className="feedback-quick-visibility type-label-3" aria-label={showingResolved ? "디자인 확인완료 피드백 숨기기" : "디자인 확인완료 피드백도 표시"} aria-pressed={showingResolved} disabled={!showingReviews} onClick={onToggleResolved}><CheckCircle size={18} strokeWidth={1.5} aria-hidden="true" /><span>확인완료 포함</span><span className="feedback-quick-switch" aria-hidden="true"><span /></span></Button>
          <Button variant="unstyled" className="feedback-quick-create type-label-3" onClick={() => setChoosingKind(true)}><span className="feedback-quick-plus"><Plus size={20} strokeWidth={1.8} aria-hidden="true" /></span>새 피드백 남기기<ArrowUpRight size={16} aria-hidden="true" /></Button>
          <Button variant="unstyled" className="feedback-quick-visibility feedback-quick-exit type-label-3" onClick={() => { setOpen(false); onExit(); }}><LogOut01 size={18} strokeWidth={1.5} aria-hidden="true" /><span>리뷰 모드 종료</span></Button>
        </div>}
        {open && choosingKind && <div id="feedback-kind-picker" role="group" aria-label="피드백 요청 유형">
          <span className="feedback-wheel-hint type-caption-1">방향으로 이동 후 놓기<br />가운데로 돌아오면 취소</span>
          {feedbackKinds.map((kind, index) => <Button key={kind.value} variant="unstyled" className="feedback-wheel-option type-label-3" data-kind={kind.value} aria-pressed={hovered === index} onPointerEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onClick={() => choose(index)} style={{ "--wheel-x": `${positions[index].x}px`, "--wheel-y": `${positions[index].y}px`, "--wheel-delay": `${index * 18}ms` } as CSSProperties}>
            <span className="feedback-wheel-symbol" aria-hidden="true">{symbols[index]}</span>{kind.label}
          </Button>)}
        </div>}
        <Button ref={trigger} variant="primary" shape="full" className="feedback-trigger" aria-label="리뷰 피드백 메뉴 열기" aria-expanded={open} aria-controls={open ? choosingKind ? "feedback-kind-picker" : "feedback-review-menu" : undefined}
          onPointerDown={event => {
            if (event.button !== 0 || !choosingKind || !open) return;
            gesture.current = { x: event.clientX, y: event.clientY, moved: false };
            event.currentTarget.setPointerCapture(event.pointerId);
            setOpen(true); setHovered(null);
          }}
          onPointerMove={event => {
            if (!gesture.current) return;
            if (Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 10) gesture.current.moved = true;
            setHovered(direction(event.clientX, event.clientY));
          }}
          onPointerUp={event => {
            if (!gesture.current) return;
            const index = direction(event.clientX, event.clientY);
            if (index !== null) choose(index);
            else if (gesture.current.moved) setOpen(false);
            gesture.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { gesture.current = null; setOpen(false); }}
          onClick={() => { if (!choosingKind || !open) { setChoosingKind(false); setOpen(value => !value); } }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M7 9h10M7 13h6" /></svg>
          {selected ? "유형 변경" : "리뷰 · 피드백"}
        </Button>
      </div>
    </div>
  </>;
}
