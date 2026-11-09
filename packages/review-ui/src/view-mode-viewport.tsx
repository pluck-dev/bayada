"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Input } from "./ui";
import { Button } from "./ui";

export type Size = { width: number; height: number };
export type Device = "desktop" | "tablet" | "mobile";
export const devices: Record<Device, Size> = { desktop: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 375, height: 812 } };
const names: Record<Device, string> = { desktop: "데스크탑", tablet: "태블릿", mobile: "모바일" };
const clamp = (value: number) => Math.max(240, Math.min(3840, Math.round(value)));

function Dimension({ label, value, onCommit }: { label: string; value: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const editing = useRef(false);
  useEffect(() => { if (!editing.current) setDraft(String(value)); }, [value]);
  return <Input type="number" aria-label={label} className="view-mode-dimension type-caption-1" value={draft} min={240} max={3840}
    onFocus={() => { editing.current = true; }} onChange={event => setDraft(event.target.value)}
    onBlur={() => { editing.current = false; const next = clamp(Number(draft) || value);setDraft(String(next));onCommit(next); }}
    onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />;
}

function RouteInput({ device, route, onNavigate }: { device: Device; route: string; onNavigate: (path: string) => void }) {
  const [draft, setDraft] = useState(route);
  const editing = useRef(false), input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!editing.current) setDraft(route); }, [route]);
  return <form className="view-mode-route" onSubmit={event => {
    event.preventDefault();
    try {
      const url = new URL(draft.trim(), window.location.origin);
      if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) throw new Error("origin");
      url.searchParams.delete("__viewframe");
      const path = url.pathname + url.search + url.hash;
      input.current?.setCustomValidity("");editing.current = false;setDraft(path);input.current?.blur();onNavigate(path);
    } catch { input.current?.setCustomValidity("현재 사이트의 URL 또는 /로 시작하는 경로를 입력해 주세요.");input.current?.reportValidity(); }
  }}>
    <Input ref={input} aria-label={`${names[device]} URL`} className="type-caption-1" value={draft} required placeholder="/경로 또는 현재 사이트 URL" autoComplete="off" spellCheck={false}
      onFocus={() => { editing.current = true; }} onBlur={() => { editing.current = false; }} onChange={event => { event.currentTarget.setCustomValidity("");setDraft(event.target.value); }} />
    <Button variant="secondary" size="s" type="submit" aria-label={`${names[device]} URL 이동`}>이동</Button>
  </form>;
}

export function Viewport({ device, size, fillHeight, route, src, frameRef, onLoad, onNavigate, onResize }: {
  device: Device; size: Size; fillHeight: boolean; route: string; src: string;
  frameRef: RefObject<HTMLIFrameElement | null>; onLoad: () => void;
  onNavigate: (path: string) => void;
  onResize: (next: Size, manualHeight: boolean) => void;
}) {
  const pane = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ width: size.width, height: size.height });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ x: number; y: number; width: number; height: number; scale: number } | null>(null);
  useEffect(() => {
    if (!pane.current) return;
    const observer = new ResizeObserver(([entry]) => setSpace(previous => previous.width === entry.contentRect.width && previous.height === entry.contentRect.height ? previous : { width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(pane.current);return () => observer.disconnect();
  }, []);
  const scale = Math.max(.05, Math.min(1, space.width / size.width, fillHeight ? 1 : space.height / size.height));
  const height = fillHeight ? Math.max(240, Math.round(space.height / scale)) : size.height;
  const end = () => { gesture.current = null;setDragging(false); };
  return <section className="view-mode-pane" aria-label={`${names[device]} 미리보기`} data-resizing={dragging}>
    <div className="view-mode-pane-label">
      <strong className="type-label-3">{device.toUpperCase()}</strong>
      <div className="view-mode-dimensions"><Dimension label={`${names[device]} 너비`} value={size.width} onCommit={width => onResize({ width, height }, false)} /><span aria-hidden="true">×</span><Dimension label={`${names[device]} 높이`} value={height} onCommit={next => onResize({ width: size.width, height: next }, true)} /></div>
      <span className="type-caption-1">{Math.round(scale * 100)}%</span>
    </div>
    <RouteInput device={device} route={route} onNavigate={onNavigate} />
    <div ref={pane} className="view-mode-pane-space">
      <div className="view-mode-device" style={{ width: size.width * scale, height: height * scale }}>
        <iframe ref={frameRef} title={`${names[device]} 화면`} src={src} onLoad={onLoad} width={size.width} height={height}
          style={{ width: size.width, height, transform: `scale(${scale})` }} />
        <Button variant="unstyled" className="view-mode-resize" aria-label={`${names[device]} 화면 크기 조절`} title="드래그 또는 방향키로 크기 조절"
          onPointerDown={event => { event.preventDefault();if (event.isTrusted) event.currentTarget.setPointerCapture(event.pointerId);gesture.current = { x: event.clientX, y: event.clientY, width: size.width, height, scale };setDragging(true); }}
          onPointerMove={event => { const start = gesture.current;if (start) onResize({ width: clamp(start.width + (event.clientX - start.x) / start.scale), height: clamp(start.height + (event.clientY - start.y) / start.scale) }, true); }}
          onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
          onKeyDown={event => { const x = event.key === "ArrowRight" ? 16 : event.key === "ArrowLeft" ? -16 : 0;const y = event.key === "ArrowDown" ? 16 : event.key === "ArrowUp" ? -16 : 0;if (x || y) { event.preventDefault();onResize({ width: clamp(size.width + x), height: clamp(height + y) }, Boolean(y)); } }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 15 10-10M10 15l5-5M15 15h.01" /></svg>
        </Button>
      </div>
    </div>
  </section>;
}
