"use client";
import { resolveFeedbackTarget, revealFeedbackTarget } from "./feedback-target-match";
import { Button as UiButton } from "./ui";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { feedbackHash, feedbackKindLabel, type FeedbackKind } from "@bayada/review/config";
import { FeedbackMarkers, feedbackTarget, InspectorFeedback } from "./inspector-feedback";
import type { FeedbackTarget, SavedFeedback } from "./shared";

import { FeedbackList, type FeedbackScope } from "./feedback-list";
import { usePathname } from "next/navigation";
import { FeedbackLauncher } from "./feedback-launcher";

type Inspection = {
  label: string;
  rect: { x: number; y: number; width: number; height: number };
  pointer: { x: number; y: number };
  padding: string;
  margin: string;
  layout: string;
  rowGap: string;
  columnGap: string;
  font: string;
  fontWeight: string;
  fontFamily: string;
  letterSpacing: string;
  classes: string;
  component: string | null;
  typography: string | null;
  paddingSides: number[];
  marginSides: number[];
  borderSides: number[];
  color: string;
  anchor: { x: number; y: number; width: number; height: number } | null;
  sameElement: boolean;
  textRect: Inspection["rect"] | null;
  anchorTextRect: Inspection["rect"] | null;
  icon: IconInfo | null;
};

type IconInfo = {
  name: string | null;
  source: "inline" | "file";
  viewBox: string | null;
  strokes: { authored: number; rendered: number }[];
  stroke: string | null;
  fill: string | null;
  loading?: boolean;
};

const pixels = (value: number) => Math.round(value * 100) / 100;

const svgFiles = new Map<string, Element | null | "loading">();
const shapeSelector = "path, line, polyline, polygon, circle, ellipse, rect";

// 원본 선 굵기는 viewBox 단위 — 화면 크기로 환산해 실제 굵기를 보여 준다.
function svgDetails(svg: Element, width: number, computed: boolean): Omit<IconInfo, "name" | "source"> {
  const viewBox = svg.getAttribute("viewBox");
  const units = viewBox ? parseFloat(viewBox.trim().split(/[\s,]+/)[2]) : parseFloat(svg.getAttribute("width") ?? "") || width;
  const scale = units > 0 ? width / units : 1;
  const strokes = new Map<string, { authored: number; rendered: number }>();
  let stroke: string | null = null;
  let fill: string | null = null;
  for (const shape of Array.from(svg.querySelectorAll(shapeSelector))) {
    const style = computed ? getComputedStyle(shape) : null;
    const paint = style ? style.stroke : shape.closest("[stroke]")?.getAttribute("stroke") ?? "none";
    const shapeFill = style ? style.fill : shape.closest("[fill]")?.getAttribute("fill") ?? "black";
    if (shapeFill !== "none" && !fill) fill = shapeFill;
    if (paint === "none") continue;
    stroke ??= paint;
    const authored = parseFloat(style ? style.strokeWidth : shape.closest("[stroke-width]")?.getAttribute("stroke-width") ?? "1") || 0;
    const fixed = (style ? style.getPropertyValue("vector-effect") : shape.closest("[vector-effect]")?.getAttribute("vector-effect")) === "non-scaling-stroke";
    const rendered = pixels(fixed ? authored : authored * scale);
    strokes.set(`${authored}:${rendered}`, { authored: pixels(authored), rendered });
  }
  const color = (value: string | null) => value && value !== "none" ? hexColor(value) : null;
  return { viewBox, strokes: Array.from(strokes.values()), stroke: color(stroke), fill: color(fill) };
}

function iconDetails(element: Element, onLoad: () => void): IconInfo | null {
  const svg = element.closest("svg");
  if (svg) {
    const host = svg.closest("[data-icon]");
    return { name: host?.getAttribute("data-icon") ?? null, source: "inline", ...svgDetails(svg, svg.getBoundingClientRect().width, true) };
  }
  if (!(element instanceof HTMLImageElement)) return null;
  const src = element.currentSrc || element.src;
  if (!/\.svg(?:[?#]|$)/i.test(src) || new URL(src, location.href).origin !== location.origin) return null;
  const name = element.getAttribute("data-name") || element.getAttribute("data-icon");
  const file = svgFiles.get(src);
  if (file === undefined) {
    svgFiles.set(src, "loading");
    fetch(src).then(response => response.ok ? response.text() : Promise.reject())
      .then(text => svgFiles.set(src, new DOMParser().parseFromString(text, "image/svg+xml").querySelector("svg")))
      .catch(() => svgFiles.set(src, null))
      .finally(onLoad);
  }
  if (!file || file === "loading") return { name, source: "file", viewBox: null, strokes: [], stroke: null, fill: null, loading: file !== null };
  return { name, source: "file", ...svgDetails(file, element.getBoundingClientRect().width, false) };
}

function hexColor(color: string) {
  const match = color.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return color;
  const channels = match[1].split(/[\s,/]+/).filter(Boolean);
  const rgb = channels.slice(0, 3).map(channel => Math.round(parseFloat(channel) * (channel.endsWith("%") ? 2.55 : 1)));
  const alpha = channels[3] === undefined ? 1 : parseFloat(channels[3]) / (channels[3].endsWith("%") ? 100 : 1);
  if (alpha < 1) rgb.push(Math.round(alpha * 255));
  return "#" + rgb.map(channel => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function ElementInspector({ onExit }: { onExit: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [reviewKind, setReviewKind] = useState<FeedbackKind | null>(null);
  const [feedback, setFeedback] = useState<FeedbackTarget | null>(null);
  const [feedbackElement, setFeedbackElement] = useState<Element | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<SavedFeedback[]>([]);
  const [showReviews, setShowReviews] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [listScope, setListScope] = useState<FeedbackScope | null>(null);
  const pathname = usePathname();
  const [feedbackRefresh, setFeedbackRefresh] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewHash, setReviewHash] = useState("");
  const [linkRevision, setLinkRevision] = useState(0);
  const [measurement, setMeasurement] = useState<"box" | "text">("box");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const tooltip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => { setReviewHash(location.hash); setLinkRevision(value => value + 1); };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  useEffect(() => {
    const params = new URLSearchParams(reviewHash.slice(1));
    setReviewMessage("");
    if (params.has("review")) {
      setFeedback(null); setReviewKind(null); setEnabled(false); setInspection(null);
      setListScope(current => current ?? (params.get("scope") === "all" ? "all" : "page"));
    }
    const selector = params.get("feedback");
    if (!selector || selector.length > 1500) return;
    const expected = params.get("text") || "";
    let found = false;
    const locate = () => {
      const element = resolveFeedbackTarget(selector, expected);
      if (!element) return;
      revealFeedbackTarget(element);
      if (!element.getClientRects().length) return;
      found = true;
      setEnabled(false); setReviewKind(null); setInspection(null); setShowReviews(true);
      element.scrollIntoView({ block: "center" });
      element.animate([{ outline: "3px solid #2563eb", outlineOffset: "4px" }, { outline: "3px solid #2563eb", outlineOffset: "4px" }], { duration: 8000 });
    };
    const observer = new MutationObserver(() => { if (!found) locate(); });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] });
    const frame = requestAnimationFrame(locate);
    const timeout = window.setTimeout(() => { observer.disconnect(); if (!found) setReviewMessage("화면이 변경되어 대상 요소를 찾지 못했습니다. 관리자에 저장된 요소 정보를 확인해 주세요."); }, 8000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); observer.disconnect(); };
  }, [reviewHash, linkRevision]);

  useEffect(() => {
    if ((!enabled && !reviewKind) || feedback) return;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let anchor: Element | null = null;
    let altHeld = false;
    const elementAtPointer = () => {
      const element = pointer && document.elementFromPoint(pointer.x, pointer.y);
      return element && !element.closest("[data-element-inspector]") ? element : null;
    };
    const inspect = () => {
      frame = 0;
      if (!pointer) return;
      const element = elementAtPointer();
      if (!element) {
        setInspection(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      if (anchor && !anchor.isConnected) anchor = null;
      if (altHeld && !anchor) anchor = element;
      const anchorRect = anchor?.getBoundingClientRect();
      const style = getComputedStyle(element);
      const classes = Array.from(element.classList).join(" ");
      const paddingSides = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
      const marginSides = [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft];
      setInspection({
        label: element.tagName.toLowerCase() + (element.id ? `#${element.id}` : ""),
        classes,
        component: element.closest("[data-component]")?.getAttribute("data-component") ?? null,
        typography: style.getPropertyValue("--foundation-typography").trim().replace(/^(["'])(.*)\1$/, "$2")
          || element.closest("[data-typography]")?.getAttribute("data-typography") || null,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        pointer: { ...pointer },
        padding: paddingSides.join(" / "),
        margin: marginSides.join(" / "),
        layout: style.display,
        rowGap: style.rowGap,
        columnGap: style.columnGap,
        paddingSides: paddingSides.map(value => parseFloat(value) || 0),
        marginSides: marginSides.map(value => parseFloat(value) || 0),
        borderSides: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(value => parseFloat(value) || 0),
        font: `${style.fontSize} / ${style.lineHeight}`,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        letterSpacing: style.letterSpacing === "normal" ? "0px (normal)" : style.letterSpacing,
        color: hexColor(style.color),
        anchor: anchorRect ? { x: anchorRect.x, y: anchorRect.y, width: anchorRect.width, height: anchorRect.height } : null,
        sameElement: anchor === element,
        textRect: textBounds(element),
        anchorTextRect: anchor ? textBounds(anchor) : null,
        icon: iconDetails(element, schedule),
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(inspect);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!event.altKey) { altHeld = false; anchor = null; }
      else if (!altHeld) { altHeld = true; anchor = elementAtPointer(); }
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const clear = () => {
      pointer = null;
      anchor = null;
      altHeld = false;
      setInspection(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        event.preventDefault();
        if (!altHeld) { altHeld = true; anchor = elementAtPointer(); }
        schedule();
      }
      if (event.key === "Escape") {
        setEnabled(false);
        setReviewKind(null);
        clear();
      }
    };
    const release = (event: KeyboardEvent) => {
      if (event.key === "Alt" || !event.altKey) {
        if (event.key === "Alt") event.preventDefault();
        altHeld = false;
        anchor = null;
        schedule();
      }
    };
    const select = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof Element) || element.closest("[data-element-inspector]")) return;
      event.preventDefault();
      event.stopPropagation();
      if (!reviewKind) return;
      setFeedback(feedbackTarget(element));
      setFeedbackElement(element);
      clear();
    };
    document.addEventListener("click", select, true);
    document.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", clear);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.addEventListener("blur", clear);
    window.addEventListener("keydown", escape);
    window.addEventListener("keyup", release);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", select, true);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", clear);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", clear);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("keyup", release);
    };
  }, [enabled, reviewKind, feedback]);

  useLayoutEffect(() => {
    if (!inspection || !tooltip.current) return;
    const { width, height } = tooltip.current.getBoundingClientRect();
    const { x, y } = inspection.pointer;
    tooltip.current.style.left = `${Math.max(8, Math.min(x + 14, window.innerWidth - width - 8))}px`;
    tooltip.current.style.top = `${Math.max(8, y + 20 + height <= window.innerHeight - 8 ? y + 20 : y - height - 14)}px`;
  }, [inspection, measurement]);

  const useText = measurement === "text";
  const gapAnchor = (useText && inspection?.anchorTextRect) || inspection?.anchor;
  const gapTarget = (useText && inspection?.textRect) || inspection?.rect;

  return <>
    <FeedbackMarkers enabled={showReviews || !!reviewKind} includeResolved={showResolved} refreshKey={feedbackRefresh} onItems={setFeedbackItems} onSelect={item => {
      history.replaceState(null, "", "#" + feedbackHash(item.context, item.id, { scope: "page" }));
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      setFeedbackRefresh(value => value + 1);
    }} />
    {reviewMessage && <div data-element-inspector role="status" className="rv-inspector-message">{reviewMessage}<UiButton variant="unstyled" type="button" onClick={() => setReviewMessage("")}>닫기</UiButton></div>}
    {feedback && <InspectorFeedback initialKind={reviewKind ?? ""} target={feedback} element={feedbackElement} items={feedbackItems} onClose={() => setFeedback(null)} onSaved={() => setFeedbackRefresh(value => value + 1)} />}
    {enabled && !feedback && <div data-element-inspector role="group" aria-label="검사 표시 설정" className="rv-inspector-modes">
      {(["box", "text"] as const).map(mode => <UiButton variant="unstyled" key={mode} type="button" data-inspector-mode={mode} aria-pressed={measurement === mode} onClick={() => setMeasurement(mode)}>
        {mode === "box" ? "요소 박스" : "텍스트"}
      </UiButton>)}
    </div>}
    {listScope && <FeedbackList initialScope={listScope} selectionKey={reviewHash} refreshKey={feedbackRefresh + linkRevision} onClose={() => setListScope(null)} onSaved={() => setFeedbackRefresh(value => value + 1)} />}
    {!feedback && !listScope && <FeedbackLauncher inspecting={enabled} selected={reviewKind}
      showingResolved={showResolved} onToggleResolved={() => setShowResolved(value => !value)}
      showingReviews={showReviews} onToggleReviews={() => { setShowReviews(value => !value); setEnabled(false); setReviewKind(null); setInspection(null); }}
      onList={scope => { setReviewHash(""); setListScope(scope); setEnabled(false); setReviewKind(null); setInspection(null); }}
      onInspect={() => { setEnabled(current => !current); setShowReviews(false); setReviewKind(null); setInspection(null); }}
      onSelect={kind => { setReviewKind(kind); setEnabled(false); setInspection(null); }}
      onExit={onExit} />}
    {reviewKind && !feedback && <p data-element-inspector role="status" className="feedback-guidance">{feedbackKindLabel(reviewKind)} · 피드백할 요소를 클릭하세요 · Esc 취소</p>}
    {reviewKind && inspection && !feedback && <div data-element-inspector className="rv-inspector-pick" style={{ left: inspection.rect.x, top: inspection.rect.y, width: inspection.rect.width, height: inspection.rect.height }} />}
    {enabled && inspection && <div data-element-inspector className="rv-inspector-layer" aria-hidden="true">
      {inspection.anchor && <div className="rv-box rv-box-anchor" style={{ left: inspection.anchor.x, top: inspection.anchor.y, width: inspection.anchor.width, height: inspection.anchor.height }} />}
      <div className="rv-box rv-box-target" style={{ left: inspection.rect.x, top: inspection.rect.y, width: inspection.rect.width, height: inspection.rect.height }} />
      <SpacingOverlay inspection={inspection} />
      {useText && inspection.textRect && <div data-inspector-text-bounds className="rv-box rv-box-text" style={{ left: inspection.textRect.x, top: inspection.textRect.y, width: inspection.textRect.width, height: inspection.textRect.height }} />}
      {useText && inspection.anchorTextRect && !inspection.sameElement && <div className="rv-box rv-box-anchor-text" style={{ left: inspection.anchorTextRect.x, top: inspection.anchorTextRect.y, width: inspection.anchorTextRect.width, height: inspection.anchorTextRect.height }} />}
      {gapAnchor && gapTarget && !inspection.sameElement && <GapGuides anchor={gapAnchor} target={gapTarget} />}
      <div ref={tooltip} className="rv-tooltip" style={{ left: inspection.pointer.x, top: inspection.pointer.y + 20 }}>
        <p className="rv-tooltip-label">{inspection.label}</p>
        <div className="rv-tooltip-panel">
          <p className="rv-tooltip-size rv-blue"><span>요소 박스</span><strong>{pixels(inspection.rect.width)} × {pixels(inspection.rect.height)} px</strong></p>
          {inspection.textRect && <p data-inspector-text-size className="rv-tooltip-size rv-amber"><span>텍스트</span><strong>{pixels(inspection.textRect.width)} × {pixels(inspection.textRect.height)} px</strong></p>}
        </div>
        {inspection.anchor && !inspection.sameElement && <div className="rv-tooltip-panel rv-strong" data-inspector-gap>
            <p>가로 간격: {pixels(axisGap(gapAnchor!.x, gapAnchor!.width, gapTarget!.x, gapTarget!.width).gap)} px</p>
            <p>세로 간격: {pixels(axisGap(gapAnchor!.y, gapAnchor!.height, gapTarget!.y, gapTarget!.height).gap)} px</p>
        </div>}
        <dl className="rv-tooltip-grid">
          <dt>클래스</dt><dd className="rv-mono" data-inspector-classes>{inspection.classes || "없음"}</dd>
          <dt>컴포넌트</dt><dd data-inspector-component>{inspection.component || "이름 미지정"}</dd>
        </dl>
        <dl className="rv-tooltip-grid rv-divided">
          <dt className="rv-green">Padding</dt><dd data-inspector-padding>{inspection.padding}</dd>
          <dt className="rv-orange">Margin</dt><dd data-inspector-margin>{inspection.margin}</dd>
          <dt>레이아웃</dt><dd>{inspection.layout}</dd>
          <dt>가로 Gap</dt><dd data-inspector-column-gap>{inspection.columnGap === "normal" ? "normal (미지정)" : inspection.columnGap}</dd>
          <dt>세로 Gap</dt><dd data-inspector-row-gap>{inspection.rowGap === "normal" ? "normal (미지정)" : inspection.rowGap}</dd>
        </dl>
        {inspection.icon ? <dl data-inspector-icon className="rv-tooltip-grid rv-divided">
          <dt>아이콘</dt><dd>{inspection.icon.name || "이름 미지정"} · {inspection.icon.source === "inline" ? "인라인 SVG" : "SVG 파일"}</dd>
          {inspection.icon.loading ? <><dt>선 굵기</dt><dd>불러오는 중…</dd></> : <>
            <dt>viewBox</dt><dd>{inspection.icon.viewBox ?? "없음"}</dd>
            <dt>선 굵기</dt><dd data-inspector-stroke>{inspection.icon.strokes.length ? inspection.icon.strokes.map(stroke => `${stroke.rendered}px (원본 ${stroke.authored})`).join(", ") : "선 없음"}</dd>
            <dt>선 색상</dt><dd className="rv-swatch-row">{inspection.icon.stroke ? <><span className="rv-swatch" style={{ backgroundColor: inspection.icon.stroke }} />{inspection.icon.stroke}</> : "없음"}</dd>
            <dt>채움</dt><dd className="rv-swatch-row">{inspection.icon.fill ? <><span className="rv-swatch" style={{ backgroundColor: inspection.icon.fill }} />{inspection.icon.fill}</> : "없음"}</dd>
          </>}
        </dl> : <dl className="rv-tooltip-grid rv-divided">
          <dt>타이포</dt><dd data-inspector-typography>{inspection.typography || "일반 CSS 지정"}</dd>
          <dt>폰트명</dt><dd>{inspection.fontFamily}</dd>
          <dt>크기 / 행간</dt><dd>{inspection.font}</dd>
          <dt>굵기</dt><dd>{inspection.fontWeight}</dd>
          <dt>자간</dt><dd data-inspector-tracking>{inspection.letterSpacing}</dd>
          <dt>색상</dt><dd className="rv-swatch-row"><span className="rv-swatch" style={{ backgroundColor: inspection.color }} />{inspection.color}</dd>
        </dl>}
        <div data-inspector-help className="rv-tooltip-help">
          <p>{useText && inspection.textRect ? "측정 기준: 텍스트 · 노란 점선" : "측정 기준: 요소 박스 · 파란 테두리"}</p>
          <p>여백 순서: 위 / 오른쪽 / 아래 / 왼쪽</p>
          {inspection.anchor ? <p>{inspection.sameElement ? "기준 요소 고정 · 다른 요소로 이동하세요" : `${useText && inspection.anchorTextRect ? "기준 텍스트" : "기준 박스"} ↔ ${useText && inspection.textRect ? "대상 텍스트" : "대상 박스"} · 겹치는 축은 0px`}</p> : <p>Alt / Option을 누른 채 이동하면 간격 측정</p>}
        </div>
      </div>
    </div>}
  </>;
}

function SpacingOverlay({ inspection }: { inspection: Inspection }) {
  const { rect, paddingSides: padding, borderSides: border } = inspection;
  const margin = inspection.marginSides.map(value => Math.max(0, value));
  return <>
    <div data-inspector-margin-overlay className="rv-box rv-box-spacing" style={{ left: rect.x - margin[3], top: rect.y - margin[0], width: rect.width + margin[1] + margin[3], height: rect.height + margin[0] + margin[2], borderStyle: "solid", borderColor: "rgba(251, 146, 60, .3)", borderWidth: margin.map(value => `${value}px`).join(" ") }} />
    <div data-inspector-padding-overlay className="rv-box rv-box-spacing" style={{ left: rect.x + border[3], top: rect.y + border[0], width: Math.max(0, rect.width - border[1] - border[3]), height: Math.max(0, rect.height - border[0] - border[2]), borderStyle: "solid", borderColor: "rgba(74, 222, 128, .3)", borderWidth: padding.map(value => `${value}px`).join(" ") }} />
  </>;
}

function textBounds(element: Element): Inspection["rect"] | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const rects: DOMRect[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const start = text.search(/\S/);
    const parent = node.parentElement;
    if (start < 0 || !parent || parent.closest("script, style, [data-element-inspector]")) continue;
    const style = getComputedStyle(parent);
    if (style.visibility !== "visible" || style.opacity === "0") continue;
    range.setStart(node, start);
    range.setEnd(node, text.trimEnd().length);
    rects.push(...Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0));
  }
  if (!rects.length) return null;
  const x = Math.min(...rects.map(rect => rect.left));
  const y = Math.min(...rects.map(rect => rect.top));
  return { x, y, width: Math.max(...rects.map(rect => rect.right)) - x, height: Math.max(...rects.map(rect => rect.bottom)) - y };
}

function axisGap(start: number, size: number, targetStart: number, targetSize: number) {
  const end = start + size;
  const targetEnd = targetStart + targetSize;
  if (end < targetStart) return { from: end, to: targetStart, gap: targetStart - end };
  if (targetEnd < start) return { from: targetEnd, to: start, gap: start - targetEnd };
  const middle = (Math.max(start, targetStart) + Math.min(end, targetEnd)) / 2;
  return { from: middle, to: middle, gap: 0 };
}

function GapGuides({ anchor, target }: { anchor: Inspection["rect"]; target: Inspection["rect"] }) {
  const horizontal = axisGap(anchor.x, anchor.width, target.x, target.width);
  const vertical = axisGap(anchor.y, anchor.height, target.y, target.height);
  const y = vertical.gap ? anchor.y + anchor.height / 2 : vertical.from;
  const x = horizontal.gap ? target.x + target.width / 2 : horizontal.from;
  return <svg className="rv-guides" data-inspector-guides>
    {horizontal.gap > 0 && <DistanceGuide
      path={`M${horizontal.from},${y}H${horizontal.to} M${horizontal.from},${y - 5}v10 M${horizontal.to},${y - 5}v10`}
      x={(horizontal.from + horizontal.to) / 2} y={y - 20} distance={horizontal.gap}
    />}
    {vertical.gap > 0 && <DistanceGuide
      path={`M${x},${vertical.from}V${vertical.to} M${x - 5},${vertical.from}h10 M${x - 5},${vertical.to}h10`}
      x={x} y={(vertical.from + vertical.to) / 2} distance={vertical.gap}
    />}
  </svg>;
}

function DistanceGuide({ path, x, y, distance }: { path: string; x: number; y: number; distance: number }) {
  const label = `${pixels(distance)} px`;
  const width = label.length * 8 + 20;
  return <g>
    <path d={path} fill="none" stroke="#0f172a" strokeWidth="5" />
    <path d={path} fill="none" stroke="#facc15" strokeWidth="2" />
    <rect x={x - width / 2} y={y - 13} width={width} height="26" rx="5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontFamily="monospace" fontWeight="700" fontSize="13">{label}</text>
  </g>;
}
