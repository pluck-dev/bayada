"use client";

import { feedbackStatusKeys, feedbackStatuses, type FeedbackStatus } from "@bayada/review/config";
import { setFeedbackStatus } from "@/lib/actions/feedback";
import { cx, selectClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 한 건 상태 변경 — 보던 상태(expected)일 때만 바꾼다 */
export function FeedbackStatusSelect({ id, status, className }: { id: number; status: FeedbackStatus; className?: string }) {
  const { run, isPending } = useAction();
  return (
    <select
      aria-label={`피드백 #${id} 상태 변경`}
      value={status}
      disabled={isPending}
      className={cx(selectClass, "w-auto! min-w-[132px]", className)}
      onChange={(e) => {
        const next = e.target.value as FeedbackStatus;
        if (next === status) return;
        void run(() => setFeedbackStatus([id], next, status));
      }}
    >
      {feedbackStatusKeys.map((s) => (
        <option key={s} value={s}>
          {feedbackStatuses[s]}
        </option>
      ))}
    </select>
  );
}
