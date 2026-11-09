"use client";

import { useEffect, useState } from "react";
import { Copy01, Check } from "@untitledui/icons";
import { departmentLabel, reviewSites } from "@bayada/review/config";
import { Button, Textarea } from "./ui";
import { useReviewSite, type SavedFeedback } from "./shared";

// 로컬 개발 화면에서만 보이는 "AI에 전달" 복사 — 피드백을 개발 도구에 그대로 붙여 넣기 위한 것
export function FeedbackCopy({ item, pagePath }: { item: SavedFeedback; pagePath: string }) {
  const site = useReviewSite();
  const [local, setLocal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState("");
  useEffect(() => {
    const host = window.location.hostname;
    setLocal(host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]");
  }, []);
  async function copy() {
    const text = [
      `[${reviewSites[site].brand} 피드백 #${item.id}]`,
      `페이지: ${pagePath}`,
      ...(item.department ? [`소속: ${departmentLabel(item.department)}`] : []),
      ...(item.assignee ? [`작성자: ${item.assignee}`] : []),
      ...(item.tags?.length ? [`태그: ${item.tags.map(tag => `#${tag}`).join(" ")}`] : []),
      ...(item.context?.selector ? [`요소: ${item.context.selector}`] : []),
      `요청: ${item.body}`,
    ].join("\n");
    setCopied(false);
    try { await navigator.clipboard.writeText(text); setCopied(true); setFallback(""); }
    catch { setFallback(text); }
  }
  if (!local) return null;
  return <div className="feedback-copy">
    <Button variant="ghost" size="s" onClick={copy} aria-label={`피드백 #${item.id} AI 전달용 복사`} leadingIcon={copied ? <Check size={14} aria-hidden="true" /> : <Copy01 size={14} aria-hidden="true" />}><span role="status">{copied ? "복사됨" : "AI에 전달"}</span></Button>
    {fallback && <div className="feedback-copy-fallback"><p className="type-caption-1" role="status">클립보드 권한을 사용할 수 없습니다. 아래 내용을 직접 복사해 주세요.</p><Textarea aria-label={`피드백 #${item.id} 복사 내용`} readOnly rows={5} value={fallback} onFocus={event => event.currentTarget.select()} /><Button variant="ghost" size="s" onClick={() => setFallback("")}>닫기</Button></div>}
  </div>;
}
