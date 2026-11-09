"use client";

import { feedbackStatusKeys, feedbackStatuses, type FeedbackStatus } from "@bayada/review/config";
import { setFeedbackStatus } from "@/lib/actions/feedback";
import { Select, cx } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 한 건 상태 변경 — 보던 상태(expected)일 때만 바꾼다 */
export function FeedbackStatusSelect({ id, status, className }: { id: number; status: FeedbackStatus; className?: string }) {
  const { run, isPending } = useAction();
  return (
    <Select
      size="sm"
      aria-label={`피드백 #${id} 상태 변경`}
      value={status}
      disabled={isPending}
      className={cx("min-w-[132px]", className)}
      options={feedbackStatusKeys.map((s) => ({ value: s, label: feedbackStatuses[s] }))}
      onChange={(v) => {
        const next = v as FeedbackStatus;
        if (next === status) return;
        void run(() => setFeedbackStatus([id], next, status));
      }}
    />
  );
}
