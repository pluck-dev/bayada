"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleAlert } from "lucide-react";
import type { CourseStatus } from "@bayada/db";
import type { Permission } from "@/lib/rbac";
import { availableTransitions, type ChecklistItem, type Transition } from "@/lib/workflow";
import { transitionProgram } from "@/lib/actions/programs";
import { COURSE_STATUS_LABEL } from "@/lib/labels";
import { Button, Tooltip, cx, textareaClass } from "@/components/ui";
import { useAction, useFeedback } from "@/components/ui/feedback";

export function Checklist({ items }: { items: ChecklistItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => (
        <li key={c.key} className="flex items-start gap-2 text-caption">
          {c.ok ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="충족" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="미충족" />
          )}
          <span className={cx("flex-1", c.ok ? "text-ink" : "text-danger")}>
            {c.label}
            <span className={cx("ml-1.5 text-caption", c.ok ? "text-muted" : "text-red-400")}>{c.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// 버튼 순서·스타일 — 진행(primary) / 보조 / 되돌림
const ORDER: Record<string, number> = {
  submit: 0,
  start_review: 0,
  to_clinical: 1,
  approve: 2,
  publish: 0,
  request_changes: 3,
  restore: 4,
  archive: 5,
};

export function WorkflowPanel({
  courseId,
  status,
  permissions,
  checklist,
  afterHref,
}: {
  courseId: string;
  status: CourseStatus;
  permissions: Permission[];
  checklist: ChecklistItem[];
  /** 처리 후 이동할 곳 (검토 화면 → 큐) */
  afterHref?: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const { run, isPending } = useAction();
  const { toast } = useFeedback();
  const transitions = availableTransitions(status, permissions).sort((a, b) => ORDER[a.action] - ORDER[b.action]);
  const needsNote = transitions.some((t) => t.noteRequired || t.action === "to_clinical" || t.action === "approve");
  const missing = checklist.filter((c) => !c.ok);

  const go = (t: Transition) => {
    if (t.noteRequired && !note.trim()) {
      document.getElementById("review-note")?.focus();
      toast("error", "수정 요청 사유를 검토 의견에 입력하세요.");
      return;
    }
    return run(() => transitionProgram(courseId, t.action, note), {
      confirm: t.confirm ? { title: `${t.label}할까요?`, body: t.confirm, confirmLabel: t.label, danger: t.action === "archive" } : undefined,
      refresh: !afterHref,
      onSuccess: () => {
        setNote("");
        if (afterHref) router.push(afterHref);
      },
    });
  };

  if (!transitions.length) {
    return (
      <p className="text-caption text-muted">
        현재 상태(<b className="font-medium text-ink">{COURSE_STATUS_LABEL[status]}</b>)에서 이 계정이 할 수 있는 작업이 없습니다.
      </p>
    );
  }

  const primaryAction = transitions[0].action;

  return (
    <div className="flex flex-col gap-3">
      {needsNote && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-note" className="text-caption font-medium text-ink-soft">
            검토 의견
          </label>
          <textarea
            id="review-note"
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={textareaClass}
            placeholder="수정 요청 시 필수. 승인·임상 리뷰 이관 시에도 이력에 남습니다."
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {transitions.map((t) => {
          const blocked = t.action === "submit" && missing.length > 0;
          const isPrimary = t.action === primaryAction && t.action !== "request_changes" && t.action !== "archive";
          return (
            <Tooltip
              key={t.action}
              className="flex w-full [&>button]:flex-1"
              content={blocked ? `필수 항목 미입력: ${missing.map((m) => m.label).join(", ")}` : undefined}
            >
              <Button
                variant={t.action === "archive" ? "danger" : isPrimary ? "brand" : t.action === "to_clinical" ? "primary" : "secondary"}
                className="w-full"
                disabled={isPending || blocked}
                onClick={() => go(t)}
              >
                {t.label}
              </Button>
            </Tooltip>
          );
        })}
      </div>
      {transitions.some((t) => t.action === "submit") && missing.length > 0 && (
        <p className="text-caption text-danger">필수 항목 {missing.length}개를 채워야 승인 요청할 수 있습니다.</p>
      )}
    </div>
  );
}
