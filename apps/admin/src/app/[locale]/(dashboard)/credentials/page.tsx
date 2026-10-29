import Link from "next/link";
import type { CredentialAppStatus } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { listApplications } from "@/lib/queries/credentials";
import {
  CREDENTIAL_APP_STATUSES,
  CREDENTIAL_APP_STATUS_LABEL,
  CREDENTIAL_APP_STATUS_TONE,
  judge,
} from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { SelectFilter } from "@/components/SelectFilter";

export default async function CredentialQueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; program?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("credential.read", locale);
  const sp = await searchParams;
  const status = (CREDENTIAL_APP_STATUSES as string[]).includes(sp.status ?? "") ? (sp.status as CredentialAppStatus) : undefined;
  const programId = sp.program || undefined;
  const data = await listApplications({ status, programId });
  const base = `/${locale}/credentials`;
  const isEvaluator = can(user, "credential.evaluate");

  return (
    <>
      <PageHeader
        title="바야다 인증 심사·발급"
        description="심사위원이 시험·실기 점수를 입력해 합격/불합격을 판정하면, 운영자가 승인해 인증번호를 발급합니다."
        actions={
          data.programs.length > 1 && (
            <SelectFilter
              param="program"
              label="인증 과정"
              value={programId ?? ""}
              options={[{ value: "", label: "전체 인증 과정" }, ...data.programs.map((p) => ({ value: p.id, label: p.title }))]}
            />
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="심사 상태">
        <FilterChip href={qs(base, { program: programId })} active={!status} count={data.all}>
          전체
        </FilterChip>
        {CREDENTIAL_APP_STATUSES.map((s) => (
          <FilterChip key={s} href={qs(base, { status: s, program: programId })} active={status === s} count={data.counts[s]}>
            {CREDENTIAL_APP_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <div className={tableWrap}>
        {data.rows.length === 0 ? (
          <EmptyState
            title={status ? `${CREDENTIAL_APP_STATUS_LABEL[status]} 신청이 없습니다` : "아직 접수된 인증 신청이 없습니다"}
            description={status ? undefined : "학습자가 선수 프로그램을 모두 수료한 뒤 아카데미의 인증 과정 페이지에서 신청하면 여기에 쌓입니다."}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>응시자</th>
                <th className={thClass}>인증 과정</th>
                <th className={thClass}>평가</th>
                <th className={cx(thClass, "text-right")}>점수</th>
                <th className={thClass}>심사위원 판정</th>
                <th className={thClass}>운영자 승인</th>
                <th className={thClass}>신청일</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const passed = r.status === "SUBMITTED" ? null : judge(r.program, r.examScore, r.practicalScore);
                const evaluated = r.status === "EVALUATED" || r.status === "APPROVED" || (r.status === "REJECTED" && passed !== null);
                return (
                  <tr key={r.id} className={trClass}>
                    <td className={tdClass}>
                      <Link href={`${base}/applications/${r.id}`} className="font-medium hover:underline">
                        {r.user.name ?? r.user.email}
                      </Link>
                      <p className="text-[11.5px] text-subtle">{r.user.email}</p>
                    </td>
                    <td className={cx(tdClass, "max-w-[240px] truncate")} title={r.program.title}>
                      {r.program.title}
                    </td>
                    <td className={cx(tdClass, "text-zinc-600")}>{r.program.practicalRequired ? "시험 + 실기" : "시험"}</td>
                    <td className={cx(tdClass, "tabular text-right text-zinc-700")}>
                      {r.examScore ?? "-"}
                      {r.program.practicalRequired && <span className="text-subtle"> / {r.practicalScore ?? "-"}</span>}
                    </td>
                    <td className={tdClass}>
                      {evaluated && passed !== null ? (
                        <Badge tone={passed ? "blue" : "red"}>{passed ? "합격" : "불합격"}</Badge>
                      ) : r.status === "EVALUATING" ? (
                        <Badge tone="violet" dot>
                          평가 중{r.evaluator ? ` · ${r.evaluator.name ?? r.evaluator.email}` : ""}
                        </Badge>
                      ) : r.status === "SUBMITTED" ? (
                        <Badge tone="zinc">평가 대기</Badge>
                      ) : (
                        <span className="text-subtle">-</span>
                      )}
                    </td>
                    <td className={tdClass}>
                      {r.status === "EVALUATED" || r.status === "APPROVED" || r.status === "REJECTED" ? (
                        <Badge tone={CREDENTIAL_APP_STATUS_TONE[r.status]} dot={r.status === "EVALUATED"}>
                          {CREDENTIAL_APP_STATUS_LABEL[r.status]}
                        </Badge>
                      ) : (
                        <span className="text-subtle">-</span>
                      )}
                    </td>
                    <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {isEvaluator && !can(user, "credential.approve") && (
        <p className="mt-3 px-1 text-[12px] text-muted">심사위원은 평가·판정까지 할 수 있습니다. 발급(승인)·반려는 운영자가 합니다.</p>
      )}
    </>
  );
}
