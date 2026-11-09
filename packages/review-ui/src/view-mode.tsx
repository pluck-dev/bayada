"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "./ui";
import { Checkbox } from "./ui";
import { DropdownSelect } from "./ui";
import { Viewport, devices, type Device, type Size } from "./view-mode-viewport";
import { alignScroll, framePath, previewUrl } from "./view-mode-scroll";

type Mode = "desktop" | "tablet" | "mobile" | "split" | "split-tablet" | "triple";
type Side = "first" | "second" | "third";
const sides: Side[] = ["first", "second", "third"];
const labels: Record<Mode, string> = { desktop: "데스크탑 · 기본", tablet: "태블릿", mobile: "모바일", split: "2분할 · 데스크탑 + 모바일", "split-tablet": "2분할 · 데스크탑 + 태블릿", triple: "3분할 · 데스크탑 + 태블릿 + 모바일" };
const options = (Object.keys(labels) as Mode[]).map(value => ({ value, label: labels[value] }));
const ratio = (value: number) => Math.max(.25, Math.min(.8, value));

export function ViewMode({ onOpen }: { onOpen: () => void }) {
  const router = useRouter();
  const [framed, setFramed] = useState<boolean | null>(null);
  const [menu, setMenu] = useState(false), [mode, setMode] = useState<Mode>("desktop");
  const [src, setSrc] = useState(""), [routes, setRoutes] = useState({ first: "", second: "", third: "" });
  const [pageLinked, setPageLinked] = useState(true), [scrollLinked, setScrollLinked] = useState(true), [fillHeight, setFillHeight] = useState(true);
  const [sizes, setSizes] = useState<Record<Device, Size>>(devices);
  const [split, setSplit] = useState(.72), [resizing, setResizing] = useState(false);
  const [tripleSplit, setTripleSplit] = useState([.55, .84]);
  const [ready, setReady] = useState({ first: false, second: false, third: false });
  const readyRef = useRef(ready), pendingRoute = useRef<Record<Side, string>>({ first: "", second: "", third: "" }), initialPosition = useRef(false);
  const sourcePath = useRef(""), resync = useRef(false), detached = useRef<Record<Side, boolean>>({ first: false, second: false, third: false });
  const menuRoot = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLIFrameElement>(null), second = useRef<HTMLIFrameElement>(null), third = useRef<HTMLIFrameElement>(null);
  const frames = { first, second, third };
  const splitMode = mode === "split" || mode === "split-tablet" || mode === "triple";
  const activeDevices: Device[] = mode === "triple" ? ["desktop", "tablet", "mobile"] : mode === "split-tablet" ? ["desktop", "tablet"] : mode === "split" ? ["desktop", "mobile"] : [mode];
  const overlay = useRef<HTMLDivElement>(null), panes = useRef<HTMLDivElement>(null), dragging = useRef<number | null>(null);
  const close = useCallback(() => {
    const child = first.current?.contentWindow, path = framePath(child);
    if (path && child?.document.readyState === "complete" && path === framePath(window)) alignScroll(child, window);
    setMode("desktop");setMenu(false);
    if (path && path !== framePath(window)) router.push(path);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }, [router]);
  const choose = (next: Mode) => {
    setMenu(false);
    if (next === "desktop") { close();return; }
    onOpen();
    const path = framePath(first.current?.contentWindow) || framePath(window) || "/";
    setSrc(previewUrl(path));setRoutes({ first: path, second: path, third: path });
    readyRef.current = { first: false, second: false, third: false };setReady(readyRef.current);
    initialPosition.current = false;pendingRoute.current = { first: "", second: path, third: path };
    sourcePath.current = path;detached.current = { first: false, second: false, third: false };
    setSplit(next === "split-tablet" ? .65 : ratio(1 - Math.min(375, window.innerWidth * .33) / Math.max(1, window.innerWidth - 60)));
    setTripleSplit([.55, .84]);
    setMode(next);
  };
  useEffect(() => { setFramed(window.self !== window.top); }, []);
  useEffect(() => {
    if (!menu) return;
    menuRoot.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const pointer = (event: PointerEvent) => { if (!menuRoot.current?.contains(event.target as Node)) setMenu(false); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenu(false);trigger.current?.focus(); } };
    document.addEventListener("pointerdown", pointer);window.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", pointer);window.removeEventListener("keydown", key); };
  }, [menu]);
  useEffect(() => {
    if (mode === "desktop") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";document.body.dataset.viewModeActive = "true";
    const background = [...document.body.children].filter(node => node instanceof HTMLElement && !node.contains(overlay.current) && !node.hasAttribute("data-radix-popper-content-wrapper")) as HTMLElement[];
    const inert = background.map(node => node.inert);background.forEach(node => { node.inert = true; });
    const players = [...document.querySelectorAll<HTMLCanvasElement>("canvas")].map(canvas => (canvas as HTMLCanvasElement & { orb?: { state: { playing: boolean }; pause(): void; play(): void } }).orb).filter(player => player?.state.playing);
    players.forEach(player => player?.pause());overlay.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector('[role="listbox"]')) close();
      if (event.key === "Tab" && overlay.current) {
        const elements = [...overlay.current.querySelectorAll<HTMLElement>("button,input,iframe")];
        if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault();elements.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault();elements[0]?.focus(); }
      }
    };
    window.addEventListener("keydown", key, true);
    return () => {
      document.body.style.overflow = previous;delete document.body.dataset.viewModeActive;
      background.forEach((node, i) => { node.inert = inert[i]; });players.forEach(player => player?.play());window.removeEventListener("keydown", key, true);
    };
  }, [mode, close]);
  useEffect(() => {
    if (mode === "desktop" || !ready.first) return;
    const windows = [first.current?.contentWindow, second.current?.contentWindow, third.current?.contentWindow].filter(win => framePath(win)) as Window[];
    const key = (event: KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented && !(event.currentTarget as Window).document.querySelector('[role="listbox"]')) close(); };
    windows.forEach(win => win.addEventListener("keydown", key, true));return () => windows.forEach(win => win.removeEventListener("keydown", key, true));
  }, [ready, mode, close]);
  useEffect(() => {
    if (mode === "desktop" || !ready.first) return;
    const source = first.current?.contentWindow;
    if (!source || !framePath(source)) return;
    const targets = ([{ side: "second", win: second.current?.contentWindow }, { side: "third", win: third.current?.contentWindow }] as const).filter(target => target.win);
    let timer = 0, resume = false;
    const follow = () => {
      timer = 0;const path = framePath(source);if (!path) return;
      setRoutes(previous => previous.first === path ? previous : { ...previous, first: path });
      for (const { side, win: target } of targets) {
        if (!target || (!resume && detached.current[side])) continue;
        if (resume) detached.current[side] = false;
        if (framePath(target) !== path) {
          if (resume && pageLinked && pendingRoute.current[side] !== path) {
            const loading = framePath(target)?.split("#")[0] !== path.split("#")[0];
            pendingRoute.current[side] = loading ? path : "";
            if (loading) { readyRef.current = { ...readyRef.current, [side]: false };setReady(readyRef.current); }
            target.location.replace(previewUrl(path));
          }
          continue;
        }
        if (scrollLinked && readyRef.current[side] && target.document.readyState === "complete") alignScroll(source, target);
      }
      resume = false;
    };
    const schedule = (shouldResume = false) => { resume ||= shouldResume;if (!timer) timer = window.setTimeout(follow, 16); };
    const interact = () => schedule(true);
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "popstate", "hashchange"];
    events.forEach(event => source.addEventListener(event, interact, { passive: true }));
    const scroll = () => schedule();
    source.addEventListener("scroll", scroll, { passive: true });
    const cleanups: (() => void)[] = [];
    const observer = new ResizeObserver(() => schedule());observer.observe(source.document.body);
    targets.forEach(({ side, win }) => {
      if (!win || !framePath(win) || !ready[side]) return;
      const browse = () => { detached.current[side] = true;pendingRoute.current[side] = ""; };
      ["pointerdown", "keydown", "wheel", "touchstart"].forEach(event => win.addEventListener(event, browse, { passive: true }));
      cleanups.push(() => ["pointerdown", "keydown", "wheel", "touchstart"].forEach(event => win.removeEventListener(event, browse)));
      if (win.document.body) observer.observe(win.document.body);
    });
    // Observe source navigation only. A secondary viewport may browse elsewhere
    // until the next desktop action, without replaying clicks or form writes.
    const navigation = window.setInterval(() => {
      const path = framePath(source);
      if (path && path !== sourcePath.current) { sourcePath.current = path;schedule(true); }
      targets.forEach(({ side, win }) => {
        const current = framePath(win);
        if (current) setRoutes(previous => previous[side] === current ? previous : { ...previous, [side]: current });
        if (current && current !== path && !pendingRoute.current[side]) detached.current[side] = true;
      });
    }, 150);
    if (resync.current) { resync.current = false;schedule(true); }
    return () => { events.forEach(event => source.removeEventListener(event, interact));source.removeEventListener("scroll", scroll);cleanups.forEach(cleanup => cleanup());observer.disconnect();clearTimeout(timer);clearInterval(navigation); };
  }, [mode, pageLinked, scrollLinked, ready]);
  const frameLoaded = (side: Side) => {
    const win = frames[side].current?.contentWindow, path = framePath(win);
    if (!win || !path) return;
    readyRef.current = { ...readyRef.current, [side]: true };setReady(readyRef.current);setRoutes(previous => ({ ...previous, [side]: path }));
    if (side === "first" && !initialPosition.current) { initialPosition.current = true;alignScroll(window, win); }
    if (side !== "first" && pendingRoute.current[side] === path) {
      pendingRoute.current[side] = "";
      if (scrollLinked && !detached.current[side] && first.current?.contentWindow && framePath(first.current.contentWindow) === path) alignScroll(first.current.contentWindow, win);
    }
  };
  const navigate = (side: Side, path: string) => {
    const win = frames[side].current?.contentWindow;if (!win) return;
    if (side !== "first") { detached.current[side] = true;pendingRoute.current[side] = ""; }
    if (framePath(win)?.split("#")[0] !== path.split("#")[0]) { readyRef.current = { ...readyRef.current, [side]: false };setReady(readyRef.current); }
    win.location.assign(previewUrl(path));
  };
  const resize = (device: Device, next: Size, manualHeight: boolean) => { setSizes(previous => ({ ...previous, [device]: next }));if (manualHeight) setFillHeight(false); };
  const adjustDivider = (index: number, value: number) => {
    if (mode !== "triple") { setSplit(ratio(value));return; }
    setTripleSplit(previous => previous.map((position, i) => i === index ? Math.max(index ? previous[0] + .12 : .2, Math.min(index ? .88 : previous[1] - .12, value)) : position));
  };
  const moveDivider = (x: number, index: number) => { const bounds = panes.current?.getBoundingClientRect();if (bounds) adjustDivider(index, (x - bounds.left) / Math.max(1, bounds.width)); };
  if (framed !== false) return null;
  return <>
    <div ref={menuRoot} className="view-mode-trigger-wrap" data-element-inspector>
      <Button ref={trigger} variant="secondary" shape="full" aria-haspopup="menu" aria-expanded={menu} aria-controls="view-mode-menu" onClick={() => { onOpen();setMenu(value => !value); }}>VIEW MODE</Button>
      {menu && <div id="view-mode-menu" className="view-mode-menu" role="menu" aria-label="뷰 모드 선택" onKeyDown={event => {
        const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')], index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === "ArrowDown" ? (index + 1) % items.length : event.key === "ArrowUp" ? (index - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
        if (next >= 0) { event.preventDefault();items[next]?.focus(); }
      }}>{options.map(option => <Button key={option.value} variant="ghost" role="menuitemradio" aria-checked={mode === option.value} onClick={() => choose(option.value as Mode)}>{option.label}</Button>)}</div>}
    </div>
    {mode !== "desktop" && createPortal(<div ref={overlay} className="foundation-theme view-mode-overlay" role="dialog" aria-modal="true" aria-busy={activeDevices.some((_, index) => !ready[sides[index]])} aria-label="반응형 화면 비교" data-view-mode-overlay data-element-inspector>
      <div className="view-mode-bar">
        <div className="view-mode-mode-field"><span className="type-label-3">VIEW MODE</span><DropdownSelect label="뷰 모드" value={mode} options={options} onValueChange={value => choose(value as Mode)} layer="inspector" /></div>
        <div className="view-mode-options">
          {splitMode && <>
            <Checkbox checked={pageLinked} onChange={event => { resync.current = event.target.checked;setPageLinked(event.target.checked); }} aria-label="페이지 미러링">페이지 미러링</Checkbox>
            <Checkbox checked={scrollLinked} onChange={event => { resync.current = event.target.checked;setScrollLinked(event.target.checked); }} aria-label="스크롤 미러링">스크롤 미러링</Checkbox>
          </>}
          <Checkbox checked={fillHeight} onChange={event => setFillHeight(event.target.checked)} aria-label="화면 높이 맞춤">높이 맞춤</Checkbox>
        </div>
        <div className="view-mode-bar-actions"><Button variant="ghost" size="s" onClick={() => { setSizes(devices);setSplit(mode === "split-tablet" ? .65 : .72);setTripleSplit([.55, .84]);setFillHeight(true); }}>초기화</Button><Button variant="secondary" size="s" onClick={close}>닫기</Button></div>
      </div>
      {splitMode && <div className="view-mode-mirror-status type-caption-1" role="status">{pageLinked || scrollLinked ? "태블릿·모바일은 따로 둘러볼 수 있으며, 데스크탑을 다시 조작하면 켜진 미러링을 반영합니다." : "각 화면을 독립적으로 조작합니다."}</div>}
      <div ref={panes} className="view-mode-panes" data-split={splitMode} data-resizing={resizing} key={mode} style={splitMode ? { gridTemplateColumns: mode === "triple" ? `minmax(0,${tripleSplit[0]}fr) var(--space-12) minmax(0,${tripleSplit[1] - tripleSplit[0]}fr) var(--space-12) minmax(0,${1 - tripleSplit[1]}fr)` : `minmax(0,${split}fr) var(--space-12) minmax(0,${1 - split}fr)` } : undefined}>
        {activeDevices.map((device, index) => <Fragment key={device}>
          {index > 0 && <div className="view-mode-divider" role="separator" tabIndex={0} aria-orientation="vertical" aria-label={`화면 분할 너비 조절 ${index}`} aria-valuemin={mode === "triple" ? index === 1 ? 20 : Math.round((tripleSplit[0] + .12) * 100) : 25} aria-valuemax={mode === "triple" ? index === 1 ? Math.round((tripleSplit[1] - .12) * 100) : 88 : 80} aria-valuenow={Math.round((mode === "triple" ? tripleSplit[index - 1] : split) * 100)}
            onPointerDown={event => { event.preventDefault();if (event.isTrusted) event.currentTarget.setPointerCapture(event.pointerId);dragging.current = index - 1;setResizing(true); }}
            onPointerMove={event => { if (dragging.current !== null) moveDivider(event.clientX, dragging.current); }} onPointerUp={() => { dragging.current = null;setResizing(false); }} onPointerCancel={() => { dragging.current = null;setResizing(false); }} onLostPointerCapture={() => { dragging.current = null;setResizing(false); }}
            onKeyDown={event => { const delta = event.key === "ArrowRight" ? .02 : event.key === "ArrowLeft" ? -.02 : 0;if (delta) { event.preventDefault();adjustDivider(index - 1, (mode === "triple" ? tripleSplit[index - 1] : split) + delta); } }}><span /></div>}
          <Viewport device={device} size={sizes[device]} fillHeight={fillHeight} route={routes[sides[index]]} src={src} frameRef={frames[sides[index]]} onLoad={() => frameLoaded(sides[index])} onNavigate={path => navigate(sides[index], path)} onResize={(next, height) => resize(device, next, height)} />
        </Fragment>)}
      </div>
    </div>, document.body)}
  </>;
}
