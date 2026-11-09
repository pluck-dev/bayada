"use client";

import { useState } from "react";
import { FEEDBACK_BODY_MAX } from "@bayada/review/config";
import { addFeedbackReply } from "@/lib/actions/feedback";
import { Button, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 관리자 댓글·답글 — 사이트 리뷰 도구의 댓글 목록에 "관리자"로 표시된다 */
export function FeedbackReplyForm({ feedbackId, parentId, compact }: { feedbackId: number; parentId?: number; compact?: boolean }) {
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(!compact);
  const { run, isPending } = useAction();
  if (!open) {
    return (
      <button type="button" className="mt-1 text-caption font-medium text-muted hover:text-ink" onClick={() => setOpen(true)}>
        답글 달기
      </button>
    );
  }
  const label = parentId ? `댓글 ${parentId}에 답글` : "새 댓글";
  return (
    <form
      className="mt-2 grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        void run(() => addFeedbackReply(feedbackId, body, parentId ?? null), {
          onSuccess: () => {
            setBody("");
            if (compact) setOpen(false);
          },
        });
      }}
    >
      <label className="sr-only" htmlFor={`reply-${feedbackId}-${parentId ?? "root"}`}>
        {label}
      </label>
      <textarea
        id={`reply-${feedbackId}-${parentId ?? "root"}`}
        className={textareaClass}
        rows={3}
        maxLength={FEEDBACK_BODY_MAX}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "답글을 입력하세요" : "진행 상황이나 확인 요청을 남기면 사이트 리뷰 도구에서 클라이언트가 봅니다"}
        disabled={isPending}
      />
      <div className="flex justify-end gap-1.5">
        {compact && (
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            취소
          </Button>
        )}
        <Button size="sm" variant="secondary" type="submit" disabled={isPending || !body.trim()}>
          {parentId ? "답글 등록" : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
