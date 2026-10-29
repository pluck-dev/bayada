"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, Lock, Star } from "lucide-react";
import type { ProgramRow } from "@/lib/queries/programs";
import {
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  JOB_ROLE_LABEL,
  PRODUCT_TYPE_LABEL,
  VISIBILITY_LABEL,
  formatDate,
} from "@/lib/labels";
import { setVisibility } from "@/lib/actions/programs";
import { Badge, Button, EmptyState, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function VisibilityPill({ value }: { value: "INTERNAL" | "PUBLIC" }) {
  return value === "PUBLIC" ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-sky-700">
      <Globe className="h-3.5 w-3.5" aria-hidden />
      {VISIBILITY_LABEL.PUBLIC}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] text-zinc-500">
      <Lock className="h-3.5 w-3.5" aria-hidden />
      {VISIBILITY_LABEL.INTERNAL}
    </span>
  );
}

export function ProgramTable({ rows, locale, canWrite }: { rows: ProgramRow[]; locale: string; canWrite: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { run, isPending } = useAction();
  const ids = useMemo(() => rows.map((r) => r.id), [rows]);
  const visibleSelected = ids.filter((id) => selected.has(id));
  const allChecked = ids.length > 0 && visibleSelected.length === ids.length;

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const apply = (targetIds: string[], to: "INTERNAL" | "PUBLIC") =>
    run(() => setVisibility(targetIds, to), {
      confirm:
        to === "PUBLIC"
          ? {
              title: `${targetIds.length}개 프로그램을 외부에 공개할까요?`,
              body: "게시 상태인 프로그램은 바야다 직원이 아닌 외부 학습자에게도 카탈로그에 노출되고 수강 신청을 받습니다.",
              confirmLabel: "외부 공개",
            }
          : {
              title: `${targetIds.length}개 프로그램을 사내 전용으로 바꿀까요?`,
              body: "외부 학습자에게 더 이상 노출되지 않습니다. 이미 수강 중인 외부 학습자의 기록은 유지됩니다.",
              confirmLabel: "사내 전용",
            },
      onSuccess: () => setSelected(new Set()),
    });

  if (!rows.length) {
    return (
      <div className={tableWrap}>
        <EmptyState title="조건에 맞는 프로그램이 없습니다" description="검색어나 필터를 바꿔 보세요." />
      </div>
    );
  }

  return (
    <>
      {canWrite && (
        <div
          className={cx(
            "mb-2 flex h-10 items-center gap-2 rounded-lg border px-3 text-[12.5px] transition-colors",
            visibleSelected.length ? "border-zinc-900 bg-zinc-900 text-white" : "border-dashed border-line text-muted",
          )}
          aria-live="polite"
        >
          {visibleSelected.length ? (
            <>
              <span className="font-medium">{visibleSelected.length}개 선택</span>
              <span className="mx-1 h-4 w-px bg-zinc-700" aria-hidden />
              <button
                type="button"
                disabled={isPending}
                onClick={() => apply(visibleSelected, "PUBLIC")}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                외부 공개로 전환
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => apply(visibleSelected, "INTERNAL")}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 font-medium text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden />
                사내 전용으로 전환
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-zinc-400 hover:text-white">
                선택 해제
              </button>
            </>
          ) : (
            <span>프로그램을 선택하면 사내 ↔ 외부 공개범위를 한 번에 바꿀 수 있습니다.</span>
          )}
        </div>
      )}

      <div className={cx(tableWrap, "max-h-[calc(100vh-290px)]")}>
        <table className={tableClass}>
          <thead>
            <tr>
              {canWrite && (
                <th className={cx(thClass, "w-9")}>
                  <input
                    type="checkbox"
                    aria-label="전체 선택"
                    checked={allChecked}
                    onChange={() => setSelected(allChecked ? new Set() : new Set(ids))}
                    className="h-3.5 w-3.5 accent-zinc-900"
                  />
                </th>
              )}
              <th className={thClass}>프로그램명</th>
              <th className={thClass}>유형</th>
              <th className={thClass}>대상 직군</th>
              <th className={thClass}>제공기관</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>공개범위</th>
              <th className={cx(thClass, "text-right")}>수강생</th>
              <th className={thClass}>수정일</th>
              {canWrite && <th className={cx(thClass, "w-px")} aria-label="작업" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cx(trClass, selected.has(r.id) && "bg-zinc-50")}>
                {canWrite && (
                  <td className={tdClass}>
                    <input
                      type="checkbox"
                      aria-label={`${r.title} 선택`}
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="h-3.5 w-3.5 accent-zinc-900"
                    />
                  </td>
                )}
                <td className={cx(tdClass, "min-w-[300px] max-w-[380px] whitespace-normal!")}>
                  <Link href={`/${locale}/programs/${r.id}`} className="font-medium text-fg hover:underline">
                    {r.title}
                  </Link>
                  {r.featured && <Star className="ml-1 inline h-3 w-3 fill-amber-400 text-amber-400" aria-label="메인 큐레이션" />}
                  {r.category && <p className="mt-0.5 text-[11.5px] text-subtle">{r.category.name}</p>}
                </td>
                <td className={cx(tdClass, "text-zinc-600")}>{PRODUCT_TYPE_LABEL[r.productType]}</td>
                <td className={cx(tdClass, "text-zinc-600")}>
                  {r.audiences.length ? (
                    r.audiences.map((a) => JOB_ROLE_LABEL[a]).join(", ")
                  ) : (
                    <span className="text-amber-700">미지정</span>
                  )}
                </td>
                <td className={cx(tdClass, "text-zinc-600")}>{r.provider?.name ?? <span className="text-amber-700">미지정</span>}</td>
                <td className={tdClass}>
                  <Badge tone={COURSE_STATUS_TONE[r.status]} dot>
                    {COURSE_STATUS_LABEL[r.status]}
                  </Badge>
                </td>
                <td className={tdClass}>
                  <VisibilityPill value={r.visibility} />
                </td>
                <td className={cx(tdClass, "tabular text-right text-zinc-700")}>{r._count.enrollments.toLocaleString()}</td>
                <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(r.updatedAt)}</td>
                {canWrite && (
                  <td className={tdClass}>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => apply([r.id], r.visibility === "PUBLIC" ? "INTERNAL" : "PUBLIC")}
                      title={r.visibility === "PUBLIC" ? "사내 전용으로 전환" : "외부 공개로 전환"}
                    >
                      {r.visibility === "PUBLIC" ? "사내로" : "외부 공개"}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-muted">{rows.length}개 프로그램</p>
    </>
  );
}
