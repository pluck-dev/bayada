import type { CourseStatus } from "@bayada/db";
import type { HistoryEntry } from "@/lib/queries/programs";
import { AUDIT_ACTION_LABEL, COURSE_STATUSES, COURSE_STATUS_LABEL, COURSE_STATUS_TONE, formatDateTime } from "@/lib/labels";
import { Badge, EmptyState, cx } from "@/components/ui";

function asStatus(v: unknown): CourseStatus | null {
  return typeof v === "string" && (COURSE_STATUSES as string[]).includes(v) ? (v as CourseStatus) : null;
}

const STATUS_ACTIONS = new Set([
  "course.create",
  "course.submit",
  "course.start_review",
  "course.to_clinical",
  "course.approve",
  "course.request_changes",
  "course.publish",
  "course.archive",
  "course.restore",
]);

export function HistoryTimeline({ entries, publishedAt }: { entries: HistoryEntry[]; publishedAt: Date | null }) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-line">
        <EmptyState
          title="기록된 이력이 없습니다"
          description={
            publishedAt
              ? `WordPress 에서 이전된 프로그램입니다 (최초 게시 ${formatDateTime(publishedAt)}). 이후 변경부터 이력이 쌓입니다.`
              : "상태 변경·수정 이력이 여기에 쌓입니다."
          }
        />
      </div>
    );
  }
  return (
    <ol className="relative ml-2 border-l border-line">
      {entries.map((e) => {
        const d = (e.detail ?? {}) as Record<string, unknown>;
        const from = asStatus(d.from);
        const to = asStatus(d.to);
        const isStatus = STATUS_ACTIONS.has(e.action);
        const note = typeof d.note === "string" ? d.note : null;
        return (
          <li key={e.id} className="relative pb-5 pl-5 last:pb-0">
            <span
              className={cx(
                "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white",
                isStatus ? "bg-zinc-900" : "bg-zinc-300",
              )}
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-medium">{AUDIT_ACTION_LABEL[e.action] ?? e.action}</span>
              {from && to && (
                <span className="flex items-center gap-1 text-[12px] text-muted">
                  <Badge tone={COURSE_STATUS_TONE[from]}>{COURSE_STATUS_LABEL[from]}</Badge>→
                  <Badge tone={COURSE_STATUS_TONE[to]}>{COURSE_STATUS_LABEL[to]}</Badge>
                </span>
              )}
              {e.action === "course.visibility" && (
                <span className="text-[12px] text-muted">
                  {d.from === "PUBLIC" ? "외부" : "사내"} → {d.to === "PUBLIC" ? "외부" : "사내"}
                </span>
              )}
              {e.action === "course.curriculum" && typeof d.op === "string" && <span className="text-[12px] text-muted">{d.op}</span>}
            </div>
            <p className="mt-0.5 text-[12px] text-muted">
              {e.actor ? `${e.actor.name ?? e.actor.email} · ${e.actor.roleLabel}` : "시스템"} · {formatDateTime(e.at)}
            </p>
            {note && <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-zinc-50 px-3 py-2 text-[12.5px] text-zinc-700">{note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
