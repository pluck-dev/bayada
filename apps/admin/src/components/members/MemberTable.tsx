"use client";

import { useState } from "react";
import Link from "next/link";
import type { JobRole, Role, UserStatus } from "@bayada/db";
import { decideSignup } from "@/lib/actions/members";
import { JOB_ROLE_LABEL, ROLE_LABEL, USER_STATUS_LABEL, USER_STATUS_TONE, formatDate } from "@/lib/labels";
import { Badge, Button, EmptyState, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

interface Row {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  jobRole: JobRole | null;
  createdAt: string;
  organization: { name: string; isInternal: boolean } | null;
  _count: { enrollments: number; certificates: number };
}

export function MemberTable({ rows, locale, canWrite, selfId }: { rows: Row[]; locale: string; canWrite: boolean; selfId: string }) {
  const { run, isPending } = useAction();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pendingIds = rows.filter((r) => r.status === "PENDING").map((r) => r.id);
  const sel = pendingIds.filter((id) => selected.has(id));

  const decide = (ids: string[], decision: "APPROVED" | "REJECTED") =>
    run(() => decideSignup(ids, decision), {
      confirm:
        decision === "REJECTED"
          ? { title: `${ids.length}명의 가입을 거절할까요?`, body: "거절된 계정은 로그인할 수 없습니다. 나중에 다시 승인할 수 있습니다.", confirmLabel: "거절", danger: true }
          : ids.length > 1
            ? { title: `${ids.length}명의 가입을 승인할까요?`, confirmLabel: "승인" }
            : undefined,
      onSuccess: () => setSelected(new Set()),
    });

  if (!rows.length) {
    return (
      <div className={tableWrap}>
        <EmptyState title="조건에 맞는 회원이 없습니다" description="승인 대기 필터에서 비어 있으면 처리할 가입 신청이 없는 상태입니다." />
      </div>
    );
  }

  return (
    <>
      {canWrite && sel.length > 0 && (
        <div className="mb-2 flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-3 text-[12.5px] text-white">
          <span className="font-medium">승인 대기 {sel.length}명 선택</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => decide(sel, "APPROVED")}
            className="ml-2 h-7 rounded-md bg-white px-2.5 font-medium text-zinc-900 hover:bg-zinc-100"
          >
            일괄 승인
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => decide(sel, "REJECTED")}
            className="h-7 rounded-md px-2.5 font-medium text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-800"
          >
            일괄 거절
          </button>
        </div>
      )}
      <div className={cx(tableWrap, "max-h-[calc(100vh-300px)]")}>
        <table className={tableClass}>
          <thead>
            <tr>
              {canWrite && (
                <th className={cx(thClass, "w-9")}>
                  <input
                    type="checkbox"
                    aria-label="승인 대기 전체 선택"
                    disabled={!pendingIds.length}
                    checked={pendingIds.length > 0 && sel.length === pendingIds.length}
                    onChange={() => setSelected(sel.length === pendingIds.length ? new Set() : new Set(pendingIds))}
                    className="h-3.5 w-3.5 accent-zinc-900"
                  />
                </th>
              )}
              <th className={thClass}>회원</th>
              <th className={thClass}>소속</th>
              <th className={thClass}>역할</th>
              <th className={thClass}>직군</th>
              <th className={thClass}>상태</th>
              <th className={cx(thClass, "text-right")}>수강</th>
              <th className={cx(thClass, "text-right")}>수료증</th>
              <th className={thClass}>가입일</th>
              {canWrite && <th className={cx(thClass, "w-px")} aria-label="작업" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cx(trClass, r.status === "PENDING" && "bg-amber-50/40")}>
                {canWrite && (
                  <td className={tdClass}>
                    {r.status === "PENDING" && (
                      <input
                        type="checkbox"
                        aria-label={`${r.email} 선택`}
                        checked={selected.has(r.id)}
                        onChange={() =>
                          setSelected((s) => {
                            const n = new Set(s);
                            if (n.has(r.id)) n.delete(r.id);
                            else n.add(r.id);
                            return n;
                          })
                        }
                        className="h-3.5 w-3.5 accent-zinc-900"
                      />
                    )}
                  </td>
                )}
                <td className={tdClass}>
                  <Link href={`/${locale}/members/${r.id}`} className="font-medium hover:underline">
                    {r.name ?? "(이름 없음)"}
                  </Link>
                  <p className="text-[12px] text-muted">{r.email}</p>
                </td>
                <td className={cx(tdClass, "text-zinc-600")}>
                  {r.organization ? (
                    <>
                      {r.organization.name}
                      {r.organization.isInternal && <span className="ml-1.5 text-[11px] text-subtle">사내</span>}
                    </>
                  ) : (
                    <span className="text-subtle">외부 개인</span>
                  )}
                </td>
                <td className={cx(tdClass, "text-zinc-600")}>{ROLE_LABEL[r.role]}</td>
                <td className={cx(tdClass, "text-zinc-600")}>{r.jobRole ? JOB_ROLE_LABEL[r.jobRole] : <span className="text-subtle">-</span>}</td>
                <td className={tdClass}>
                  <Badge tone={USER_STATUS_TONE[r.status]} dot>
                    {USER_STATUS_LABEL[r.status]}
                  </Badge>
                </td>
                <td className={cx(tdClass, "tabular text-right")}>{r._count.enrollments}</td>
                <td className={cx(tdClass, "tabular text-right")}>{r._count.certificates}</td>
                <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(r.createdAt)}</td>
                {canWrite && (
                  <td className={tdClass}>
                    {r.status === "PENDING" && r.id !== selfId && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="dark" disabled={isPending} onClick={() => decide([r.id], "APPROVED")}>
                          승인
                        </Button>
                        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => decide([r.id], "REJECTED")}>
                          거절
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
