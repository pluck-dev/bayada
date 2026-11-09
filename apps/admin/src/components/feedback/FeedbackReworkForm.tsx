"use client";

import { useState } from "react";
import { FEEDBACK_BODY_MAX } from "@bayada/review/config";
import { requestFeedbackRework } from "@/lib/actions/feedback";
import { Button, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 상세 화면 재수정 요청 — 미처리로 되돌리고 사유를 남긴다 (사이트 카드에 "최근 재수정 요청"으로 보임) */
export function FeedbackReworkForm({ id }: { id: number }) {
  const [reason, setReason] = useState("");
  const { run, isPending } = useAction();
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        void run(() => requestFeedbackRework([id], reason), { onSuccess: () => setReason("") });
      }}
    >
      <label htmlFor={`rework-${id}`} className="text-caption font-medium text-ink">
        사유
      </label>
      <textarea
        id={`rework-${id}`}
        className={textareaClass}
        rows={4}
        required
        maxLength={FEEDBACK_BODY_MAX}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="수정이 필요한 내용을 적어 주세요."
        disabled={isPending}
      />
      <Button size="sm" variant="secondary" type="submit" disabled={isPending || !reason.trim()}>
        재수정 요청
      </Button>
    </form>
  );
}
