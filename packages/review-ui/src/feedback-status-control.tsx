"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { RefreshCcw01, Trash01, ChevronDown } from "@untitledui/icons";
import { FEEDBACK_BODY_MAX, feedbackStatusKeys as states, feedbackStatuses, manualFeedbackTransitions, type FeedbackStatus } from "@bayada/review/config";
import { Button, Textarea } from "./ui";
import { REVIEW_API, readResult } from "./shared";

export function FeedbackStatusControl({ id, status, onSaved, pagePath, reworkReason, reworkRequestedAt, compactActions = false }: { id: number; status: FeedbackStatus; onSaved: () => void; pagePath?: string; reworkReason?: string | null; reworkRequestedAt?: string | null; compactActions?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(status);
  const [requesting, setRequesting] = useState(false);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(REVIEW_API.feedback, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, expectedStatus: selected, page_path: pagePath ?? location.pathname + location.search }) });
      await readResult(response, "삭제하지 못했습니다.");
      setDeleting(false); onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "삭제하지 못했습니다."); }
    finally { setBusy(false); }
  }
  useEffect(() => { setSelected(status); }, [status]);
  async function update(next: FeedbackStatus, submitted = false) {
    if (busy || next === selected || !manualFeedbackTransitions[selected].includes(next)) return;
    if (next === "open" && selected !== "discussion" && !submitted) { setRequesting(true); setError(""); return; }
    const previous = selected;
    setSelected(next); setBusy(true); setError("");
    try {
      const response = await fetch(REVIEW_API.feedback, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status: next, expectedStatus: previous, reworkReason: next === "open" && previous !== "discussion" ? reason.trim() : undefined, page_path: pagePath ?? location.pathname + location.search }) });
      await readResult(response, "상태를 변경하지 못했습니다.");
      setRequesting(false); setReason(""); onSaved();
    } catch (cause) { setSelected(previous); setError(cause instanceof Error ? cause.message : "상태를 변경하지 못했습니다."); }
    finally { setBusy(false); }
  }
  const actions = <>
    {!requesting && !deleting && <div className="feedback-card-actions"><Button variant="outline" size="s" leadingIcon={<RefreshCcw01 size={14} aria-hidden="true" />} disabled={busy || selected === "open" || selected === "discussion"} onClick={() => { setRequesting(true); setError(""); }}>재수정 요청</Button><Button variant="ghost" size="s" leadingIcon={<Trash01 size={14} aria-hidden="true" />} disabled={busy} onClick={() => { setDeleting(true); setError(""); }}>삭제</Button></div>}
    {deleting && <div className="feedback-delete-confirm" role="group" aria-label="피드백 삭제 확인"><p className="type-caption-1">이 피드백을 삭제할까요? 목록과 화면 마커에서 사라집니다.</p><div><Button size="s" variant="ghost" disabled={busy} onClick={() => setDeleting(false)}>취소</Button><Button size="s" variant="primary" disabled={busy} onClick={remove}>삭제 확인</Button></div></div>}
    {requesting && <form className="feedback-rework-form" onSubmit={event => { event.preventDefault(); if (reason.trim()) void update("open", true); }}>
      <label className="type-caption-1" htmlFor={`feedback-rework-${id}`}>재수정 사유</label>
      <Textarea id={`feedback-rework-${id}`} autoFocus required maxLength={FEEDBACK_BODY_MAX} rows={3} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} placeholder="어떤 부분이 반영되지 않았는지, 어떻게 수정해야 하는지 알려주세요." />
      <p className="type-caption-1">사유를 저장하면 미처리로 돌아갑니다.</p>
      <div><Button size="s" variant="ghost" disabled={busy} onClick={() => { setRequesting(false); setReason(""); }}>취소</Button><Button size="s" variant="primary" type="submit" disabled={busy || !reason.trim()}>재수정 요청 저장</Button></div>
    </form>}
  </>;
  return <div className="foundation-theme feedback-status" data-compact={compactActions} data-status={selected} aria-label={`피드백 ${id} 상태`}>
    <div className="feedback-status-heading type-caption-1"><span>처리 상태</span><span role="status">{busy ? "저장 중…" : ""}</span></div>
    <div className="feedback-status-toggle" role="group" aria-label="처리 상태 변경" aria-busy={busy} style={{ "--status-index": states.indexOf(selected) } as CSSProperties}>
      <span className="feedback-status-indicator" aria-hidden="true" />
      {states.map(value => <Button key={value} variant="unstyled" className="feedback-status-option type-caption-2" aria-pressed={selected === value} disabled={busy || (value !== selected && !manualFeedbackTransitions[selected].includes(value))} title={value === "deployed" ? "배포완료는 관리자 화면에서 기록합니다" : value === "resolved" && selected !== "deployed" && selected !== "resolved" ? "배포완료 후 디자인을 확인할 수 있습니다" : undefined} onClick={() => update(value)}>{feedbackStatuses[value]}</Button>)}
    </div>
    {(selected === "developed" || selected === "deployed") && <div className="feedback-release-summary type-caption-1" data-ready={selected === "deployed"}><span className="feedback-release-dot" /><span>{selected === "deployed" ? "관리자가 배포완료로 처리함 · 디자인 검수 가능" : "배포 대기 · 반영 후 검수 가능"}</span></div>}
    {reworkReason && <div className="feedback-rework-note type-caption-1"><strong>최근 재수정 요청{reworkRequestedAt ? ` · ${new Date(reworkRequestedAt).toLocaleDateString("ko-KR")}` : ""}</strong><p>{reworkReason}</p></div>}
    {compactActions ? <details className="feedback-status-more type-caption-1"><summary>추가 작업 <ChevronDown size={14} aria-hidden="true" /></summary>{actions}</details> : actions}
    {error && <p role="alert" className="feedback-status-error type-caption-1">{error}</p>}
  </div>;
}
