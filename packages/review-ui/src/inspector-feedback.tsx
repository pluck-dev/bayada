"use client";
import { resolveFeedbackTarget } from "./feedback-target-match";
import { DropdownSelect, Button as UiButton, Input as UiInput, Textarea as UiTextarea } from "./ui";
import { REVIEW_API, readFeedbackProfile, readResult, saveFeedbackEditToken, saveFeedbackProfile, type FeedbackTarget, type SavedFeedback } from "./shared";
import { FeedbackCard } from "./feedback-card";
import { FEEDBACK_BODY_MAX, FEEDBACK_TAG_LENGTH, FEEDBACK_TAG_MAX, REVIEWER_NAME_MAX, feedbackDepartments, feedbackHash, feedbackKinds, isReviewerName, reviewPagePath, type FeedbackDepartment, type FeedbackKind } from "@bayada/review/config";
import { XClose } from "@untitledui/icons";

import { useEffect, useRef, useState } from "react";

/** 현재 페이지 키 — VIEW MODE iframe 표시 쿼리(__viewframe)는 빼고 저장·조회한다 */
export const currentPagePath = () => reviewPagePath(location.pathname, location.search);

function resolveTarget(selector: string, text = "") {
  return resolveFeedbackTarget(selector, text);
}

export function FeedbackMarkers({
  enabled, includeResolved, refreshKey, onItems, onSelect,
}: {
  enabled: boolean; includeResolved: boolean; refreshKey: number;
  onItems: (items: SavedFeedback[]) => void;
  onSelect: (item: SavedFeedback, element: Element | null) => void;
}) {
  const [items, setItems] = useState<SavedFeedback[]>([]);
  const pagePath = typeof window === "undefined" ? "" : currentPagePath();

  useEffect(() => {
    if (!enabled) { setItems([]); onItems([]); return; }
    const controller = new AbortController();
    async function load() {
      const collected: SavedFeedback[] = [];
      let page = 1;
      let total = 0;
      do {
        const response = await fetch(`${REVIEW_API.feedback}?path=${encodeURIComponent(pagePath)}&page=${page}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("unavailable");
        const result = await response.json();
        const batch = Array.isArray(result.items) ? result.items : [];
        collected.push(...batch);
        total = result.total ?? collected.length;
        if (!batch.length) break;
        page++;
      } while (collected.length < total && !controller.signal.aborted);
      if (!controller.signal.aborted) setItems(collected);
    }
    load().catch(error => { if (error.name !== "AbortError") setItems([]); });
    return () => controller.abort();
  }, [enabled, pagePath, refreshKey]);

  useEffect(() => { onItems(items); }, [items, onItems]);
  useEffect(() => {
    if (!items.length) return;
    const update = () => setItems(current => [...current]);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [items.length]);

  if (!enabled || !items.length) return null;
  // Design-confirmed feedback is finished work; its markers stay hidden unless asked for.
  const placed = items.filter(item => includeResolved || item.status !== "resolved").flatMap(item => {
    const element = resolveTarget(item.context.selector, item.context.text);
    if (!element || !element.getClientRects().length) return [];
    return [{ item, element, rect: element.getBoundingClientRect(), key: `element:${items.findIndex(other => resolveTarget(other.context.selector, other.context.text) === element)}` }];
  }).filter(({ rect }) => rect.top + 30 >= 0 && rect.top <= innerHeight);

  const grouped = new Map<string, { item: SavedFeedback; element: Element | null; rect: { left: number; top: number }; count: number }>();
  for (const entry of placed) {
    const group = grouped.get(entry.key);
    if (group) group.count++;
    else grouped.set(entry.key, { item: entry.item, element: entry.element, rect: entry.rect, count: 1 });
  }
  const targets = Array.from(grouped.values());

  const used: Array<{ left: number; top: number }> = [];
  const markers = targets.map(({ item, element, rect, count }) => {
    const candidates = [
      { left: rect.left, top: rect.top },
      { left: rect.left + 38, top: rect.top },
      { left: rect.left - 38, top: rect.top },
      { left: rect.left, top: rect.top + 38 },
      { left: rect.left + 38, top: rect.top + 38 },
      { left: rect.left - 38, top: rect.top + 38 },
    ].map(point => ({
      left: Math.max(4, Math.min(point.left, innerWidth - 36)),
      top: Math.max(4, Math.min(point.top, innerHeight - 36)),
    }));
    const position = candidates.find(point => used.every(other =>
      Math.abs(point.left - other.left) >= 36 || Math.abs(point.top - other.top) >= 36,
    )) ?? { left: 4 + (used.length % Math.max(1, Math.floor(innerWidth / 36))) * 36, top: Math.max(4, Math.min(rect.top + 76, innerHeight - 36)) };
    used.push(position);
    return { item, element, position, count };
  });

  return <div data-element-inspector className="feedback-markers">
    {markers.map(({ item, element, position, count }) => <UiButton variant="unstyled"
      key={item.id} type="button" data-feedback-marker={item.id} data-feedback-count={count} aria-label={`${count}건 피드백 보기`}
      onClick={() => onSelect(item, element)}
      className="feedback-marker"
      style={{ left: position.left, top: position.top }}
    >{count}</UiButton>)}
  </div>;
}

export function feedbackTarget(element: Element): FeedbackTarget {
  const parts: string[] = [];
  let node: Element | null = element;
  while (node && node !== document.documentElement) {
    if (node.id && !/^_r_|^:r/.test(node.id)) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
    const key = node.getAttribute("data-feedback-key");
    if (key && document.querySelectorAll(`[data-feedback-key="${CSS.escape(key)}"]`).length === 1) { parts.unshift(`[data-feedback-key="${CSS.escape(key)}"]`); break; }
    if (node.matches('input[name],textarea[name],select[name]')) {
      const name = node.getAttribute("name")!;
      const choice = node.matches('input[type="radio"],input[type="checkbox"]') ? `[value="${CSS.escape(node.getAttribute("value") ?? "")}"]` : "";
      const field = `${node.tagName.toLowerCase()}[name="${CSS.escape(name)}"]${choice}`;
      if (document.querySelectorAll(field).length === 1) { parts.unshift(field); break; }
    }
    const parent: Element | null = node.parentElement;
    parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${parent ? Array.from(parent.children).indexOf(node) + 1 : 1})`);
    node = parent;
  }
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    selector: parts.join(" > ").slice(0, 1500),
    tag: element.tagName.toLowerCase(),
    text: element.matches("input,textarea,select") ? "" : (element.textContent ?? "").trim().slice(0, 300),
    component: element.closest("[data-component]")?.getAttribute("data-component") ?? "",
    typography: style.getPropertyValue("--foundation-typography").trim().replace(/"/g, ""),
    font: `${style.fontFamily} / ${style.fontSize} / ${style.lineHeight} / ${style.fontWeight}`,
    color: style.color, classes: Array.from(element.classList).join(" ").slice(0, 1500),
    width: innerWidth, height: innerHeight, x: Math.max(0, rect.x + scrollX), y: Math.max(0, rect.y + scrollY),
  };
}

export function InspectorFeedback({
  target, element, items, onClose, onSaved, initialKind = "",
}: {
  target: FeedbackTarget; element: Element | null; items: SavedFeedback[]; initialKind?: FeedbackKind | "";
  onClose: () => void; onSaved: () => void;
}) {
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<FeedbackKind | "">(initialKind);
  const [department, setDepartment] = useState<FeedbackDepartment>("client");
  const [profileReady, setProfileReady] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"new" | "existing">("new");
  const reviewing = !initialKind;
  const list = useRef<HTMLDivElement>(null);
  const [locationError, setLocationError] = useState("");
  useEffect(() => {
    const savedProfile = readFeedbackProfile();
    if (savedProfile) { setDepartment(savedProfile.department); setAssignee(savedProfile.assignee); }
    setProfileReady(true);
  }, []);
  function selectProfile(nextDepartment: FeedbackDepartment, nextAssignee: string) {
    setDepartment(nextDepartment);
    setAssignee(nextAssignee);
    saveFeedbackProfile({ department: nextDepartment, assignee: nextAssignee });
  }
  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag) || tags.length >= FEEDBACK_TAG_MAX) return;
    setTags(current => [...current, tag]);
    setTagInput("");
  }
  useEffect(() => {
    setLocationError("");
    const container = list.current;
    const selected = container?.querySelector<HTMLElement>('[data-selected="true"]');
    if (container && selected) container.scrollTop += selected.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }, [target, items.length]);
  function selectFeedback(item: SavedFeedback) {
    const current = resolveTarget(item.context.selector, item.context.text);
    if (!current || !current.getClientRects().length || current.closest('[data-element-inspector]')) {
      setLocationError("화면이 변경되어 대상 위치를 찾지 못했습니다. 피드백 내용과 요소 정보를 확인해 주세요.");
      return;
    }
    setLocationError("");
    history.replaceState(null, "", "#" + feedbackHash(item.context, item.id));
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  const related = reviewing ? items : items.filter(item => {
    const current = resolveTarget(item.context.selector, item.context.text);
    return current ? current === element || Boolean(element?.contains(current)) : item.context.selector === target.selector;
  });
  const existingFeedback = related.length ? <ul className="feedback-inspector-cards">{related.map(item => <FeedbackCard key={item.id} item={item} pagePath={currentPagePath()} selected={item.context.selector === target.selector} onLocation={() => selectFeedback(item)} onSaved={onSaved} />)}</ul> : <p className="feedback-inspector-empty type-body-2">선택한 요소와 자식 요소에 남긴 피드백이 없습니다.</p>;
  return <aside data-element-inspector aria-label="요소 피드백 사이드바" className="foundation-theme feedback-inspector">
    <header className="feedback-inspector-header">
      <div className="feedback-inspector-heading"><h2 className="type-label-1">{reviewing ? "현재 화면 피드백" : "요소 피드백"}</h2>{reviewing ? <p className="type-body-2">피드백을 선택하면 해당 위치로 이동합니다.</p> : <><p className="type-body-2">{target.component || "선택한 요소"} · {target.typography || "일반 CSS"}</p><p className="feedback-inspector-target type-caption-1">{target.text || target.selector}</p></>}</div>
      <UiButton variant="unstyled" type="button" onClick={onClose} aria-label="사이드바 닫기" className="feedback-list-close"><XClose size={18} aria-hidden="true" /></UiButton>
    </header>
    {locationError && <p role="alert" className="feedback-inspector-error type-body-2">{locationError}</p>}
    {reviewing ? <div ref={list} className="feedback-inspector-body"><div className="feedback-inspector-count type-caption-1"><h3>이 페이지의 전체 피드백</h3><strong>{related.length}건</strong></div>{existingFeedback}</div> : <>
      {related.length > 0 && <div role="tablist" aria-label="요소 피드백 작업" className="feedback-inspector-tabs"><UiButton id="feedback-new-tab" aria-controls="feedback-new-panel" variant="unstyled" type="button" role="tab" aria-selected={view === "new"} onClick={() => setView("new")} className="type-caption-1">새 피드백</UiButton><UiButton id="feedback-existing-tab" aria-controls="feedback-existing-panel" variant="unstyled" type="button" role="tab" aria-selected={view === "existing"} onClick={() => setView("existing")} className="type-caption-1">기존 피드백 {related.length}건</UiButton></div>}
      {view === "existing" && related.length > 0 && <div ref={list} id="feedback-existing-panel" role="tabpanel" aria-labelledby="feedback-existing-tab" className="feedback-inspector-body">{existingFeedback}</div>}
    </>}
    {!reviewing && (view === "new" || !related.length) && <form id="feedback-new-panel" role={related.length ? "tabpanel" : undefined} aria-labelledby={related.length ? "feedback-new-tab" : undefined} className="feedback-inspector-form" onSubmit={async event => {
      event.preventDefault(); if (busy || saved) return;
      const name = assignee.trim();
      if (!isReviewerName(name)) { setMessage("작성자 이름을 입력해 주세요."); return; }
      selectProfile(department, name);
      setBusy(true); setMessage("");
      try {
        const pendingTag = tagInput.trim().replace(/^#/, "");
        const submittedTags = pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : tags;
        if (submittedTags.length > FEEDBACK_TAG_MAX) { setMessage("태그는 최대 5개까지 추가해 주세요."); return; }
        const response = await fetch(REVIEW_API.feedback, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, department, assignee: name, tags: submittedTags, body, page_path: currentPagePath(), context: target }) });
        const result = await readResult(response, "저장하지 못했습니다.");
        saveFeedbackEditToken(result.id, result.editToken);
        setSaved(true); setMessage("피드백을 저장했습니다."); onSaved();
      } catch (error) { setMessage(error instanceof Error ? error.message : "연결을 확인하고 다시 시도해 주세요."); }
      finally { setBusy(false); }
    }}>
      <div className="feedback-inspector-content">
        <h3 className="type-label-2">새 피드백 남기기</h3>
        <label className="feedback-inspector-field type-label-3">요청 유형<DropdownSelect label="요청 유형" layer="inspector" required disabled={busy || saved} value={kind} onValueChange={value => setKind(value as FeedbackKind)} placeholder="유형을 선택해 주세요" options={feedbackKinds} /></label>
        <div className="feedback-inspector-field type-label-3"><span>소속</span><div role="group" aria-label="소속" data-department={department} data-ready={profileReady} className="feedback-department-switch">{feedbackDepartments.map(item => <UiButton key={item.value} variant="unstyled" type="button" disabled={busy || saved} aria-pressed={department === item.value} onClick={() => { if (department !== item.value) selectProfile(item.value, assignee.trim()); }}>{item.label}</UiButton>)}</div></div>
        <label className="feedback-inspector-field type-label-3">작성자 이름<UiInput required maxLength={REVIEWER_NAME_MAX} disabled={!profileReady || busy || saved} value={assignee} onChange={event => setAssignee(event.target.value)} placeholder="이름을 입력해 주세요 (다음부터 자동 입력)" autoComplete="name" /></label>
        <label className="feedback-inspector-field type-label-3">상세 내용<UiTextarea required maxLength={FEEDBACK_BODY_MAX} disabled={busy || saved} value={body} onChange={event => setBody(event.target.value)} rows={3} placeholder="요청이나 피드백 내용을 구체적으로 적어 주세요." /></label>
        <div className="feedback-inspector-field type-label-3"><label htmlFor="feedback-tag-input">태그 (선택, 최대 {FEEDBACK_TAG_MAX}개)</label><div className="feedback-inspector-tag-entry"><UiInput id="feedback-tag-input" value={tagInput} maxLength={FEEDBACK_TAG_LENGTH} disabled={busy || saved || tags.length >= FEEDBACK_TAG_MAX} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} placeholder="태그 입력 후 Enter" /><UiButton variant="secondary" type="button" disabled={busy || saved || !tagInput.trim() || tags.length >= FEEDBACK_TAG_MAX} onClick={addTag}>추가</UiButton></div>{tags.length > 0 && <div className="feedback-inspector-tags">{tags.map(tag => <UiButton key={tag} variant="unstyled" type="button" disabled={busy || saved} onClick={() => setTags(current => current.filter(value => value !== tag))} aria-label={`${tag} 태그 삭제`}>#{tag} ×</UiButton>)}</div>}</div>
        <p className="feedback-inspector-note type-caption-1">{target.width} × {target.height}px 화면 · 저장 시 작성 날짜와 요소 정보도 기록합니다.</p>
        {message && <p role={saved ? "status" : "alert"} className="type-body-2">{message}</p>}
      </div>
      <div className="feedback-inspector-actions"><UiButton variant="secondary" type="button" disabled={busy} onClick={onClose}>닫기</UiButton>{!saved && <UiButton variant="primary" type="submit" disabled={busy || !body.trim() || !kind || !isReviewerName(assignee.trim())}>{busy ? "저장 중…" : "피드백 저장"}</UiButton>}</div>
    </form>}
  </aside>;
}
