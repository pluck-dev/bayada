"use client";

import { ArrowUpRight } from "@untitledui/icons";
import { departmentLabel, feedbackHash, feedbackKindLabel, isPagePath } from "@bayada/review/config";
import type { SavedFeedback } from "./shared";
import { FeedbackCopy } from "./feedback-copy";
import { FeedbackEdit } from "./feedback-edit";
import { FeedbackReplies } from "./feedback-replies";
import { FeedbackStatusControl } from "./feedback-status-control";

export function feedbackHref(item: SavedFeedback & { page_path: string }) {
  if (!isPagePath(item.page_path)) return null;
  return item.page_path.split("#")[0] + "#" + feedbackHash(item.context, item.id);
}

export function FeedbackCard({ item, pagePath, selected = false, linkParams, onLocation, onSaved }: {
  item: SavedFeedback; pagePath: string; selected?: boolean; linkParams?: URLSearchParams;
  onLocation?: () => void; onSaved: () => void;
}) {
  const baseHref = feedbackHref({ ...item, page_path: pagePath });
  const href = baseHref ? baseHref + (linkParams ? `&${linkParams}` : "") : null;
  const department = departmentLabel(item.department);
  return <li className="foundation-theme feedback-card" data-feedback-id={item.id} data-selected={selected}>
    <div className="feedback-list-meta type-caption-1"><div><span className="feedback-card-kind">{feedbackKindLabel(item.kind)}</span><span className="feedback-card-id">#{item.id}</span></div><div className="feedback-list-quick-actions"><FeedbackCopy key={`${item.id}:${item.status}:${item.rework_reason ?? ""}`} item={item} pagePath={pagePath} />{href && <a className="feedback-list-location" href={href} aria-label={`피드백 #${item.id} 위치 보기`} title="위치 보기" onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (onLocation) { onLocation(); return; }
      if (location.pathname + location.search === pagePath) {
        history.pushState(null, "", href); window.dispatchEvent(new HashChangeEvent("hashchange"));
      } else location.assign(href);
    }}><ArrowUpRight size={16} aria-hidden="true" /></a>}</div></div>
    {(item.department || item.assignee) && <div className="feedback-card-tags type-caption-1">{item.assignee && <span className="feedback-card-author">작성자 {item.assignee}{department ? ` · ${department}` : ""}</span>}{!item.assignee && department && <span>소속 {department}</span>}{item.tags?.map(tag => <span key={tag}>#{tag}</span>)}</div>}
    <p className="feedback-list-message type-body-1">{item.body}</p>
    <FeedbackEdit item={item} pagePath={pagePath} onSaved={onSaved} />
    <FeedbackReplies feedbackId={item.id} initialCount={item.reply_count} />
    <FeedbackStatusControl id={item.id} status={item.status} compactActions reworkReason={item.rework_reason} reworkRequestedAt={item.rework_requested_at} pagePath={pagePath} onSaved={onSaved} />
  </li>;
}
