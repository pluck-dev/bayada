"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FEEDBACK_BODY_MAX,
  departmentLabel,
  feedbackKindLabel,
  feedbackStatusKeys,
  feedbackStatuses,
  reviewSites,
  sectionLabel,
  type FeedbackStatus,
  type ReviewSiteKey,
} from "@bayada/review/config";
import { requestFeedbackRework, setFeedbackStatus } from "@/lib/actions/feedback";
import { FEEDBACK_KIND_TONE } from "@/lib/feedback-labels";
import { formatDateTime } from "@/lib/labels";
import { Badge, Button, Checkbox, Select, cx, tableClass, tdClass, textareaClass, thClass, trClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { FeedbackStatusSelect } from "./FeedbackStatusSelect";

export interface FeedbackTableRow {
  id: number;
  site: ReviewSiteKey;
  kind: string;
  status: FeedbackStatus;
  department: string | null;
  assignee: string | null;
  tags: string[];
  body: string;
  pagePath: string;
  section: string;
  createdAt: string;
  replies: number;
  rework: boolean;
}

function excerpt(text: string, n = 90): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

/** 피드백 목록 + 선택 일괄 처리 (상태 변경 / 재수정 요청) */
export function FeedbackTable({ rows, detailBase, detailQuery }: { rows: FeedbackTableRow[]; detailBase: string; detailQuery: string }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [target, setTarget] = useState<FeedbackStatus | "rework" | "">("");
  const [reason, setReason] = useState("");
  const { run, isPending } = useAction();
  const ids = rows.map((r) => r.id);
  const allChecked = ids.length > 0 && ids.every((id) => selected.has(id));
  const toggle = (id: number) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function apply() {
    const list = ids.filter((id) => selected.has(id));
    if (!list.length || !target) return;
    if (target === "rework") {
      if (!reason.trim()) return;
      await run(() => requestFeedbackRework(list, reason), { onSuccess: () => { setSelected(new Set()); setReason(""); setTarget(""); } });
      return;
    }
    await run(() => setFeedbackStatus(list, target), {
      confirm:
        target === "deployed" || target === "resolved"
          ? {
              title: target === "deployed" ? `선택한 ${list.length}건을 배포완료로 바꿀까요?` : `선택한 ${list.length}건의 디자인을 확인했나요?`,
              body: target === "deployed" ? "사이트 리뷰 도구에 '배포완료 · 디자인 검수 가능'으로 표시됩니다." : "디자인 확인완료 항목은 사이트 화면 마커에서 기본으로 숨겨집니다.",
              confirmLabel: target === "deployed" ? "배포완료로 변경" : "확인완료",
            }
          : undefined,
      onSuccess: () => { setSelected(new Set()); setTarget(""); },
    });
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-white" role="region" aria-label="선택 항목 일괄 처리">
          <span className="mr-1 self-center text-[13px] font-bold text-white">{selected.size}건 선택</span>
          <Select
            size="sm"
            aria-label="일괄 처리"
            className="min-w-[200px] [&>button]:bg-canvas"
            value={target}
            placeholder="처리할 작업 선택"
            onChange={(v) => setTarget(v as FeedbackStatus | "rework" | "")}
            disabled={isPending}
            options={[
              ...feedbackStatusKeys.map((s) => ({ value: s, label: `${feedbackStatuses[s]}(으)로 변경` })),
              { value: "rework", label: "재수정 요청", hint: "개발완료 이후 항목" },
            ]}
          />
          {target === "rework" && (
            <textarea
              aria-label="재수정 사유"
              className={cx(textareaClass, "min-w-[280px] flex-1")}
              rows={2}
              maxLength={FEEDBACK_BODY_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="재수정 사유 (사이트 카드에 표시됩니다)"
              disabled={isPending}
            />
          )}
          <Button size="sm" variant="brand" className="h-9 px-4" onClick={apply} disabled={isPending || !target || (target === "rework" && !reason.trim())}>
            적용
          </Button>
          <Button size="sm" variant="ghost" className="h-9 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setSelected(new Set())} disabled={isPending}>
            선택 해제
          </Button>
        </div>
      )}
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={cx(thClass, "w-px")}>
              <Checkbox
                size="sm"
                aria-label="이 페이지 전체 선택"
                checked={allChecked}
                indeterminate={selected.size > 0}
                onChange={() => setSelected(allChecked ? new Set() : new Set(ids))}
              />
            </th>
            <th className={thClass}>번호</th>
            <th className={thClass}>내용</th>
            <th className={thClass}>화면</th>
            <th className={thClass}>작성자</th>
            <th className={thClass}>유형</th>
            <th className={thClass}>상태</th>
            <th className={thClass}>등록일</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={cx(trClass, selected.has(r.id) && "bg-surface-sunken")}>
              <td className={tdClass}>
                <Checkbox size="sm" aria-label={`피드백 #${r.id} 선택`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
              </td>
              <td className={cx(tdClass, "tabular text-muted")}>#{r.id}</td>
              <td className={cx(tdClass, "max-w-[360px] whitespace-normal!")}>
                <Link href={`${detailBase}/${r.id}${detailQuery ? `?${detailQuery}` : ""}`} className="text-ink transition-colors hover:text-brand" data-tip={r.body}>
                  {excerpt(r.body)}
                </Link>
                <div className="mt-0.5 flex flex-wrap gap-x-2 text-micro text-subtle">
                  {r.replies > 0 && <span>댓글 {r.replies}</span>}
                  {r.rework && <span className="text-danger">재수정 요청</span>}
                  {r.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              </td>
              <td className={cx(tdClass, "max-w-[200px] whitespace-normal!")}>
                <span className="block text-caption font-medium text-ink">
                  {reviewSites[r.site].label} · {sectionLabel(r.site, r.section)}
                </span>
                <span className="block truncate text-micro text-subtle" data-tip={r.pagePath}>
                  {r.pagePath}
                </span>
              </td>
              <td className={cx(tdClass, "text-caption")}>
                {r.assignee || "미기록"}
                <span className="block text-micro text-subtle">{departmentLabel(r.department) || "소속 미기록"}</span>
              </td>
              <td className={tdClass}>
                <Badge tone={FEEDBACK_KIND_TONE[r.kind] ?? "zinc"}>{feedbackKindLabel(r.kind)}</Badge>
              </td>
              <td className={tdClass}>
                <FeedbackStatusSelect id={r.id} status={r.status} />
              </td>
              <td className={cx(tdClass, "tabular text-subtle")}>{formatDateTime(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
