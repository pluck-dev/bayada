"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PencilLine } from "@untitledui/icons";
import { FEEDBACK_TAG_MAX, feedbackKinds, type FeedbackKind } from "@bayada/review/config";
import { Button, DropdownSelect, Input, Textarea } from "./ui";
import { REVIEW_API, readFeedbackEditToken, readFeedbackProfile, readResult, type SavedFeedback } from "./shared";

export function FeedbackEdit({ item, pagePath, onSaved }: { item: SavedFeedback; pagePath: string; onSaved: () => void }) {
  const [editToken, setEditToken] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>(item.kind);
  const [body, setBody] = useState(item.body);
  const [tags, setTags] = useState(item.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = readFeedbackProfile();
    setEditToken(item.status === "open" && profile?.department === item.department && profile.assignee === item.assignee ? readFeedbackEditToken(item.id) : null);
  }, [item.id, item.status, item.department, item.assignee]);

  if (!editToken) return null;

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag) || tags.length >= FEEDBACK_TAG_MAX) return;
    setTags(current => [...current, tag]);
    setTagInput("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !editToken) return;
    const profile = readFeedbackProfile();
    if (profile?.department !== item.department || profile.assignee !== item.assignee) { setError("작성자 정보가 바뀌어 수정할 수 없습니다. 작성할 때의 소속·이름으로 다시 선택해 주세요."); return; }
    const pendingTag = tagInput.trim().replace(/^#/, "");
    const submittedTags = pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : tags;
    if (submittedTags.length > FEEDBACK_TAG_MAX) { setError("태그는 최대 5개까지 추가해 주세요."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(REVIEW_API.feedback, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id, page_path: pagePath, editVersion: item.edit_version, editToken, department: profile.department, assignee: profile.assignee, kind, body, tags: submittedTags }) });
      await readResult(response, "수정하지 못했습니다.");
      setEditing(false);
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "연결을 확인하고 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }

  return <div className="foundation-theme feedback-card-edit">
    {!editing ? <Button variant="ghost" size="s" leadingIcon={<PencilLine size={14} aria-hidden="true" />} onClick={() => { setKind(item.kind); setBody(item.body); setTags(item.tags ?? []); setTagInput(""); setError(""); setEditing(true); }}>내 피드백 수정</Button> :
      <form onSubmit={save}>
        <label>요청 유형<DropdownSelect label="수정할 요청 유형" layer="inspector" value={kind} onValueChange={value => setKind(value as FeedbackKind)} options={feedbackKinds} /></label>
        <label>상세 내용<Textarea required maxLength={3000} rows={4} value={body} onChange={event => setBody(event.target.value)} disabled={busy} /></label>
        <div><label htmlFor={`feedback-edit-tag-${item.id}`}>태그 (최대 5개)</label><div className="feedback-edit-tag-input"><Input id={`feedback-edit-tag-${item.id}`} maxLength={24} value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} disabled={busy || tags.length >= FEEDBACK_TAG_MAX} placeholder="태그 입력 후 Enter" /><Button variant="outline" size="s" disabled={busy || !tagInput.trim() || tags.length >= FEEDBACK_TAG_MAX} onClick={addTag}>추가</Button></div></div>
        {tags.length > 0 && <div className="feedback-edit-tags">{tags.map(tag => <Button key={tag} variant="unstyled" disabled={busy} onClick={() => setTags(current => current.filter(value => value !== tag))} aria-label={`${tag} 태그 삭제`}>#{tag} ×</Button>)}</div>}
        {error && <p role="alert">{error}</p>}
        <div className="feedback-edit-actions"><Button variant="ghost" size="s" disabled={busy} onClick={() => setEditing(false)}>취소</Button><Button variant="primary" size="s" type="submit" disabled={busy || !body.trim()}>{busy ? "저장 중…" : "수정 저장"}</Button></div>
      </form>}
  </div>;
}
