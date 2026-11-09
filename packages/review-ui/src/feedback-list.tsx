"use client";

import { useEffect, useRef, useState } from "react";
import { XClose } from "@untitledui/icons";
import { FEEDBACK_LIST_PAGE_SIZE, feedbackKinds, feedbackStatuses, reviewSites } from "@bayada/review/config";
import { Button, DropdownSelect } from "./ui";
import { REVIEW_API, readFeedbackProfile, readResult, useReviewSite, type FeedbackProfile, type SavedFeedback } from "./shared";
import { FeedbackCard } from "./feedback-card";
import { currentPagePath } from "./inspector-feedback";

export type FeedbackScope = "page" | "all";
type ListItem = SavedFeedback & { page_path: string };
type ListData = { items: ListItem[]; total: number; queryKey: string };
const kindOptions = [{ value: "", label: "모든 유형" }, ...feedbackKinds];
const validKinds = new Set<string>(feedbackKinds.map(item => item.value));

export function FeedbackList({ initialScope, onClose, onSaved, selectionKey = "", refreshKey = 0 }: { initialScope: FeedbackScope; onClose: () => void; onSaved: () => void; selectionKey?: string; refreshKey?: number }) {
  const site = useReviewSite();
  const sectionOptions = [{ value: "", label: "모든 화면" }, ...reviewSites[site].sections];
  const validSections = new Set(sectionOptions.map(option => option.value));
  const dialog = useRef<HTMLDialogElement>(null);
  const initial = new URLSearchParams(selectionKey.slice(1));
  const [scope, setScope] = useState<FeedbackScope>(initial.get("scope") === "all" ? "all" : initialScope);
  const [status, setStatus] = useState(() => { const value = initial.get("status") ?? ""; return Object.hasOwn(feedbackStatuses, value) ? value : ""; });
  const [section, setSection] = useState(() => { const value = initial.get("section") ?? ""; return validSections.has(value) ? value : ""; });
  const [kind, setKind] = useState(() => { const value = initial.get("kind") ?? ""; return validKinds.has(value) ? value : ""; });
  const [page, setPage] = useState(() => Math.max(1, Math.min(100000, Number(initial.get("listPage")) || 1)));
  const [sort, setSort] = useState(initial.get("sort") === "oldest" ? "oldest" : "newest");
  const [focusedId, setFocusedId] = useState(() => { const id = Number(initial.get("review")); return Number.isSafeInteger(id) && id > 0 ? id : null; });
  const [profile, setProfile] = useState<FeedbackProfile | null>(null);
  const [mine, setMine] = useState(false);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<ListData | null>(null);
  const [error, setError] = useState("");
  const previousQuery = useRef("");
  useEffect(() => { setProfile(readFeedbackProfile()); }, []);
  useEffect(() => {
    const params = new URLSearchParams(selectionKey.slice(1));
    const id = Number(params.get("review"));
    if (!Number.isSafeInteger(id) || id <= 0) return;
    setFocusedId(id);
    setMine(false);
    setScope(params.get("scope") === "all" ? "all" : "page");
    const nextStatus = params.get("status") ?? "";
    setStatus(Object.hasOwn(feedbackStatuses, nextStatus) ? nextStatus : "");
    const nextSection = params.get("section") ?? "";
    setSection(validSections.has(nextSection) ? nextSection : "");
    const nextKind = params.get("kind") ?? "";
    setKind(validKinds.has(nextKind) ? nextKind : "");
    setSort(params.get("sort") === "oldest" ? "oldest" : "newest");
    setPage(1);
  }, [selectionKey]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const current = dialog.current;
    current?.show();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener("keydown", escape);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("keydown", escape); window.removeEventListener("focus", refresh); current?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const queryKey = `${scope}:${section}:${status}:${kind}:${page}:${sort}:${mine ? `${profile?.department}:${profile?.assignee}` : ""}`;
    if (previousQuery.current !== queryKey) setData(null);
    previousQuery.current = queryKey;
    setError("");
    const query = new URLSearchParams({ view: "list", scope, sort, page: String(page), path: currentPagePath() });
    if (status) query.set("status", status);
    if (kind) query.set("kind", kind);
    if (scope === "all" && section) query.set("section", section);
    if (mine && profile?.assignee) {
      query.set("mine", "1");
      query.set("department", profile.department);
      query.set("assignee", profile.assignee);
    }
    fetch(`${REVIEW_API.feedback}?${query}`, { signal: controller.signal, cache: "no-store" })
      .then(response => readResult(response, "피드백을 불러오지 못했습니다."))
      .then(result => { if (!controller.signal.aborted) { if (!result.items.length && page > 1 && !focusedId) setPage(page - 1); else setData({ ...result, queryKey }); } })
      .catch(cause => { if (!controller.signal.aborted) setError(cause.message || "피드백을 불러오지 못했습니다."); });
    return () => controller.abort();
  }, [scope, section, status, kind, page, sort, mine, profile, revision, selectionKey, refreshKey, focusedId]);
  useEffect(() => {
    if (!focusedId || !data || data.queryKey !== `${scope}:${section}:${status}:${kind}:${page}:${sort}:${mine ? `${profile?.department}:${profile?.assignee}` : ""}`) return;
    const card = dialog.current?.querySelector<HTMLElement>(`[data-feedback-id="${focusedId}"]`);
    const body = dialog.current?.querySelector<HTMLElement>(".feedback-list-body");
    if (card && body) {
      const cardRect = card.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      body.scrollTop += cardRect.top - bodyRect.top - Math.max(0, (bodyRect.height - cardRect.height) / 2);
    } else if (page * FEEDBACK_LIST_PAGE_SIZE < data.total) setPage(page + 1);
    else if (status || section || kind) { setStatus(""); setSection(""); setKind(""); setPage(1); }
    else if (scope === "page") { setScope("all"); setPage(1); }
    else setError("선택한 피드백을 찾지 못했습니다.");
  }, [focusedId, data, scope, section, status, kind, page, sort, mine, profile]);
  return <dialog ref={dialog} data-element-inspector className="foundation-theme feedback-list" aria-labelledby="feedback-list-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="feedback-list-header"><h2 id="feedback-list-title" className="rv-sr-only">피드백 목록</h2>
      <div className="feedback-scope" role="group" aria-label="피드백 범위">{([['page', '현재 화면 피드백'], ['all', '전체 피드백']] as const).map(([value, label]) => <Button key={value} className="type-label-3" variant="unstyled" aria-pressed={scope === value} onClick={() => { setFocusedId(null); setScope(value); setPage(1); }}>{label}</Button>)}</div>
      <Button variant="unstyled" className="feedback-list-close" onClick={onClose} aria-label="피드백 목록 닫기" title="닫기"><XClose size={18} aria-hidden="true" /></Button>
    </header>
    <div className="feedback-list-filters">
      <div className="feedback-filter-tabs" role="group" aria-label="피드백 목록 필터">
        <Button variant="unstyled" type="button" className="type-caption-1" aria-pressed={mine} disabled={!profile?.assignee} title={!profile?.assignee ? "피드백을 한 번 작성하면 사용할 수 있습니다." : undefined} onClick={() => { setFocusedId(null); setMine(true); setStatus(""); setPage(1); }}>내 피드백</Button>
        {[["", "모든 상태"], ...Object.entries(feedbackStatuses)].map(([value, label]) => <Button key={value} className="type-caption-1" variant="unstyled" aria-pressed={!mine && status === value} onClick={() => { setFocusedId(null); setMine(false); setStatus(value); setPage(1); }}>{label}</Button>)}
      </div>
    </div>
    <div className="feedback-list-body" aria-busy={!data && !error}>
      {error ? <div role="alert"><p>{error}</p><Button size="s" onClick={() => setRevision(value => value + 1)}>다시 시도</Button></div> : !data ? <p role="status">피드백을 불러오는 중…</p> : <>
        <div className="feedback-list-count type-caption-1"><span role="status">피드백 <strong>{data.total}</strong></span><div className="feedback-list-controls">{scope === "all" && <DropdownSelect label="화면 영역 필터" layer="inspector" className="feedback-section-select" value={section} options={sectionOptions} onValueChange={value => { setFocusedId(null); setSection(value); setPage(1); }} />}<DropdownSelect label="피드백 유형 필터" layer="inspector" className="feedback-kind-select" value={kind} options={kindOptions} onValueChange={value => { setFocusedId(null); setKind(value); setPage(1); }} /><DropdownSelect label="피드백 정렬" layer="inspector" className="feedback-sort" value={sort} options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }]} onValueChange={value => { setFocusedId(null); setSort(value); setPage(1); }} /></div></div>
        {!data.items.length && <p className="type-body-2">해당하는 피드백이 없습니다.</p>}
        <ul>{data.items.map(item => <FeedbackCard key={item.id} item={item} pagePath={item.page_path} selected={focusedId === item.id} linkParams={new URLSearchParams({ scope, section, status, kind, sort, listPage: String(page) })} onSaved={() => { setRevision(value => value + 1); onSaved(); }} />)}</ul>
      </>}
    </div>
    <footer className="feedback-list-footer"><Button size="s" variant="outline" disabled={page === 1 || !data} onClick={() => { setFocusedId(null); setPage(value => value - 1); }}>이전</Button><span className="type-caption-1">{page} / {data ? Math.max(1, Math.ceil(data.total / FEEDBACK_LIST_PAGE_SIZE)) : "…"}</span><Button size="s" variant="outline" disabled={!data || page * FEEDBACK_LIST_PAGE_SIZE >= data.total} onClick={() => { setFocusedId(null); setPage(value => value + 1); }}>다음</Button></footer>
  </dialog>;
}
