"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, PencilLine, Send01, Trash01, XClose } from "@untitledui/icons";
import { FEEDBACK_BODY_MAX, REVIEWER_NAME_MAX, departmentLabel, feedbackDepartments, isReviewerName, type FeedbackDepartment } from "@bayada/review/config";
import { Button, DropdownSelect, Input, Textarea } from "./ui";
import { REVIEW_API, clearFeedbackReplyToken, readFeedbackProfile, readFeedbackReplyToken, readResult, saveFeedbackProfile, saveFeedbackReplyToken } from "./shared";

type Reply = { id: number; feedback_id: number; parent_id: number | null; author_name: string; department: string | null; body: string; created_at: string };

export function FeedbackReplies({ feedbackId, initialCount }: { feedbackId: number; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Reply[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [department, setDepartment] = useState<FeedbackDepartment>("client");
  const [assignee, setAssignee] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const profile = readFeedbackProfile();
    if (profile) { setDepartment(profile.department); setAssignee(profile.assignee); }
    setProfileReady(true);
  }, []);
  useEffect(() => {
    if (!composerOpen) return;
    const input = document.getElementById(`feedback-reply-body-${feedbackId}`);
    input?.focus({ preventScroll: true });
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [composerOpen, parentId, feedbackId, loaded]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(`${REVIEW_API.replies}?feedback_id=${feedbackId}`, { signal: controller.signal, cache: "no-store" })
      .then(response => readResult(response, "댓글을 불러오지 못했습니다."))
      .then(result => { if (!controller.signal.aborted) { setItems(result.items); setOwnedIds(new Set(result.items.filter((item: Reply) => readFeedbackReplyToken(item.id)).map((item: Reply) => item.id))); setLoaded(true); setError(""); } })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "댓글을 불러오지 못했습니다."); });
    return () => controller.abort();
  }, [open, feedbackId, refreshKey]);

  function changeProfile(nextDepartment: FeedbackDepartment, nextAssignee: string) {
    setDepartment(nextDepartment); setAssignee(nextAssignee);
    saveFeedbackProfile({ department: nextDepartment, assignee: nextAssignee });
  }
  function startReply(id: number | null) {
    setParentId(id);
    setComposerOpen(true);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const name = assignee.trim();
    if (busy || !isReviewerName(name) || !body.trim()) return;
    changeProfile(department, name);
    setEditingProfile(false);
    setBusy(true); setError("");
    try {
      const response = await fetch(REVIEW_API.replies, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback_id: feedbackId, parent_id: parentId, department, assignee: name, body }) });
      const result = await readResult(response, "댓글을 저장하지 못했습니다.");
      saveFeedbackReplyToken(result.item.id, result.deleteToken);
      setOwnedIds(current => new Set(current).add(result.item.id));
      setItems(current => [...current, result.item]); setBody(""); setParentId(null); setComposerOpen(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "댓글을 저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  async function deleteReply(id: number) {
    const deleteToken = readFeedbackReplyToken(id);
    if (!deleteToken || deletingId !== null) return;
    setDeletingId(id); setError("");
    try {
      const response = await fetch(REVIEW_API.replies, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback_id: feedbackId, id, deleteToken }) });
      await readResult(response, "댓글을 삭제하지 못했습니다.");
      clearFeedbackReplyToken(id);
      setOwnedIds(current => { const next = new Set(current); next.delete(id); return next; });
      setItems(current => current.filter(item => item.id !== id));
      if (parentId === id) { setParentId(null); setComposerOpen(false); }
      setConfirmDeleteId(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "댓글을 삭제하지 못했습니다."); }
    finally { setDeletingId(null); }
  }
  const visibleIds = new Set(items.map(item => item.id));
  const roots = items.filter(item => item.parent_id === null || !visibleIds.has(item.parent_id));
  function deleteAction(item: Reply) {
    if (!ownedIds.has(item.id)) return null;
    return confirmDeleteId === item.id
      ? <span className="feedback-reply-delete-confirm"><span>삭제할까요?</span><Button variant="ghost" size="s" type="button" onClick={() => setConfirmDeleteId(null)}>취소</Button><Button variant="ghost" size="s" type="button" disabled={deletingId === item.id} onClick={() => deleteReply(item.id)}>{deletingId === item.id ? "삭제 중…" : "삭제"}</Button></span>
      : <Button variant="unstyled" type="button" className="feedback-reply-delete" aria-label={`${item.author_name} 댓글 삭제`} title="내 댓글 삭제" onClick={() => setConfirmDeleteId(item.id)}><Trash01 size={16} aria-hidden="true" /></Button>;
  }
  return <section className="feedback-replies" aria-label={`피드백 #${feedbackId} 댓글`}>
    <div className="feedback-replies-head"><Button variant="ghost" size="s" type="button" className="feedback-replies-toggle" aria-expanded={open} onClick={() => { if (open) { setOpen(false); setComposerOpen(false); setParentId(null); } else { setOpen(true); startReply(null); } }}>
      <span>댓글</span><span className="feedback-replies-count">{loaded ? items.length : initialCount}</span><ChevronDown size={16} aria-hidden="true" />
    </Button></div>
    {open && <div className="feedback-replies-content">
      {!loaded && !error && <p role="status" className="feedback-replies-loading">댓글을 불러오는 중…</p>}
      {loaded && !items.length && <p className="feedback-replies-empty">아직 댓글이 없습니다.</p>}
      {loaded && items.length > 0 && <ol aria-label="댓글 목록" tabIndex={0}>{roots.map(item => <li key={item.id} className="feedback-reply">
        <div className="feedback-reply-meta"><strong className="type-label-2">{item.author_name}{departmentLabel(item.department) ? ` · ${departmentLabel(item.department)}` : ""}</strong><div><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</time>{deleteAction(item)}</div></div>
        <p className="type-body-1">{item.body}</p>
        {item.parent_id === null && <Button variant="unstyled" type="button" className="feedback-reply-action" onClick={() => startReply(item.id)}>답글</Button>}
        {items.filter(child => child.parent_id === item.id).map(child => <div key={child.id} className="feedback-reply feedback-reply-child">
          <div className="feedback-reply-meta"><strong className="type-label-2">{child.author_name}{departmentLabel(child.department) ? ` · ${departmentLabel(child.department)}` : ""}</strong><div><time dateTime={child.created_at}>{new Date(child.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</time>{deleteAction(child)}</div></div><p className="type-body-1">{child.body}</p>
        </div>)}
      </li>)}</ol>}
      {loaded && composerOpen && <form onSubmit={submit} className="feedback-reply-form">
        <div className="feedback-reply-form-head"><strong>{parentId === null ? "댓글 작성" : `${items.find(item => item.id === parentId)?.author_name ?? "댓글"}에게 답글`}</strong><Button variant="unstyled" type="button" className="feedback-reply-icon" aria-label="댓글 작성 닫기" title="닫기" onClick={() => { setComposerOpen(false); setParentId(null); }}><XClose size={16} aria-hidden="true" /></Button></div>
        {profileReady && isReviewerName(assignee) && !editingProfile ? <div className="feedback-reply-identity"><span>{assignee} · {departmentLabel(department)}</span><Button variant="unstyled" type="button" className="feedback-reply-icon" aria-label="작성자 변경" title="작성자 변경" onClick={() => setEditingProfile(true)}><PencilLine size={16} aria-hidden="true" /></Button></div> : <div className="feedback-reply-profile"><DropdownSelect label="소속" layer="inspector" value={department} options={feedbackDepartments} onValueChange={value => changeProfile(value as FeedbackDepartment, assignee)} /><Input aria-label="작성자 이름" placeholder="이름" maxLength={REVIEWER_NAME_MAX} value={assignee} disabled={busy} onChange={event => setAssignee(event.target.value)} /></div>}
        <Textarea id={`feedback-reply-body-${feedbackId}`} aria-label="댓글 내용" required maxLength={FEEDBACK_BODY_MAX} rows={2} value={body} disabled={busy} onChange={event => setBody(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="의견이나 진행 상황을 적어 주세요." />
        <div className="feedback-reply-submit"><span className="type-caption-1">Enter 등록 · Shift+Enter 줄바꿈</span><Button size="s" variant="primary" type="submit" aria-label={parentId === null ? "댓글 등록" : "답글 등록"} title={parentId === null ? "댓글 등록" : "답글 등록"} disabled={!profileReady || !isReviewerName(assignee.trim()) || !body.trim() || busy}><Send01 size={16} aria-hidden="true" /></Button></div>
      </form>}
      {error && <div role="alert" className="feedback-reply-error"><p>{error}</p>{!loaded && <Button variant="outline" size="s" type="button" onClick={() => { setError(""); setRefreshKey(value => value + 1); }}>다시 시도</Button>}</div>}
    </div>}
  </section>;
}
