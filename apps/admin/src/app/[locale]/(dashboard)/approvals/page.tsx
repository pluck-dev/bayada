import Link from "next/link";
import type { CourseStatus } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { listQueue } from "@/lib/queries/admin";
import { QUEUE_STATUSES } from "@/lib/workflow";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, JOB_ROLE_LABEL, PRODUCT_TYPE_LABEL, formatDateTime } from "@/lib/labels";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

const STEP_HINT: Partial<Record<CourseStatus, string>> = {
  SUBMITTED: "검토 시작 대기",
  IN_REVIEW: "형식·품질 검토 중",
  CLINICAL_REVIEW: "임상 근거 검토 중",
  APPROVED: "게시 대기",
};

export default async function ApprovalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("approval.queue", locale);
  const sp = await searchParams;
  const clinicalOnly = user.role === "CLINICAL_REVIEWER";
  const scope: CourseStatus[] = clinicalOnly ? ["CLINICAL_REVIEW"] : QUEUE_STATUSES;
  const all = await listQueue(scope);
  const filter = !clinicalOnly && scope.includes(sp.status as CourseStatus) ? (sp.status as CourseStatus) : null;
  const rows = filter ? all.filter((r) => r.status === filter) : all;
  const base = `/${locale}/approvals`;

  return (
    <>
      <PageHeader
        title="승인 대기"
        description={
          clinicalOnly
            ? "임상 근거 검토가 필요한 프로그램입니다. 검토 후 승인하거나 수정 요청하세요."
            : "승인 요청 → 형식·품질 검토 → (임상 검토) → 승인 → 게시. 오래 기다린 순서로 정렬됩니다."
        }
      />

      {!clinicalOnly && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <FilterChip href={base} active={!filter} count={all.length}>
            전체
          </FilterChip>
          {scope.map((s) => (
            <FilterChip key={s} href={qs(base, { status: s })} active={filter === s} count={all.filter((r) => r.status === s).length}>
              {COURSE_STATUS_LABEL[s]}
            </FilterChip>
          ))}
        </div>
      )}

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title="대기 중인 프로그램이 없습니다"
            description={clinicalOnly ? "임상 리뷰로 넘어온 프로그램이 생기면 여기에 표시됩니다." : "작성 중인 프로그램에서 승인 요청하면 이 큐에 들어옵니다."}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>프로그램명</th>
                <th className={thClass}>유형</th>
                <th className={thClass}>대상 직군</th>
                <th className={thClass}>제공기관</th>
                <th className={thClass}>단계</th>
                <th className={thClass}>마지막 변경</th>
                <th className={cx(thClass, "w-px")} aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={cx(tdClass, "whitespace-normal! font-medium")}>
                    <Link href={`${base}/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className={cx(tdClass, "text-zinc-600")}>{PRODUCT_TYPE_LABEL[r.productType]}</td>
                  <td className={cx(tdClass, "text-zinc-600")}>{r.audiences.map((a) => JOB_ROLE_LABEL[a]).join(", ") || "-"}</td>
                  <td className={cx(tdClass, "text-zinc-600")}>{r.provider?.name ?? "-"}</td>
                  <td className={tdClass}>
                    <Badge tone={COURSE_STATUS_TONE[r.status]} dot>
                      {COURSE_STATUS_LABEL[r.status]}
                    </Badge>
                    <span className="ml-2 text-[12px] text-subtle">{STEP_HINT[r.status]}</span>
                  </td>
                  <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDateTime(r.updatedAt)}</td>
                  <td className={tdClass}>
                    <Link href={`${base}/${r.id}`} className="text-[12.5px] font-medium text-fg underline-offset-2 hover:underline">
                      검토 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
