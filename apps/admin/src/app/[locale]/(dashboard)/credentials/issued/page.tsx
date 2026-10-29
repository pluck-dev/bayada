import Link from "next/link";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { listCredentials, type IssuedFilter } from "@/lib/queries/credentials";
import { daysUntil } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { SelectFilter } from "@/components/SelectFilter";
import { RevokeButton } from "@/components/credentials/RevokeButton";

const FILTERS: { key: IssuedFilter; label: string }[] = [
  { key: "active", label: "유효" },
  { key: "expiring", label: "만료 임박" },
  { key: "expired", label: "만료" },
  { key: "revoked", label: "취소" },
  { key: "all", label: "전체" },
];

export default async function IssuedCredentialsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; program?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("credential.approve", locale);
  const sp = await searchParams;
  const filter: IssuedFilter = FILTERS.some((f) => f.key === sp.filter) ? (sp.filter as IssuedFilter) : "active";
  const programId = sp.program || undefined;
  const data = await listCredentials(filter, programId);
  const base = `/${locale}/credentials/issued`;
  const now = new Date();

  return (
    <>
      <PageHeader
        title="발급된 인증"
        description="만료 임박은 과정별 갱신 알림 기간 안에 들어온 인증입니다. 학습자가 인증서 지갑을 열어 갱신 안내를 처음 본 시각이 '알림 확인'에 남습니다."
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

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="인증 상태">
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            href={qs(base, { filter: f.key === "active" ? undefined : f.key, program: programId })}
            active={filter === f.key}
            count={data.counts[f.key]}
          >
            {f.label}
          </FilterChip>
        ))}
      </div>

      <div className={tableWrap}>
        {data.rows.length === 0 ? (
          <EmptyState
            title={filter === "expiring" ? "갱신 알림 기간에 들어온 인증이 없습니다" : "해당하는 인증이 없습니다"}
            description={filter === "active" ? "심사 큐에서 승인하면 인증번호가 발급되어 여기에 쌓입니다." : undefined}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>인증번호</th>
                <th className={thClass}>취득자</th>
                <th className={thClass}>인증 과정</th>
                <th className={thClass}>발급일</th>
                <th className={thClass}>만료일</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>갱신 알림 확인</th>
                <th className={cx(thClass, "w-px")} aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {data.rows.map((c) => {
                const expired = !c.revokedAt && !!c.expiresAt && c.expiresAt <= now;
                const soon = data.inWindow(c);
                return (
                  <tr key={c.id} className={cx(trClass, c.revokedAt && "text-zinc-400")}>
                    <td className={cx(tdClass, "font-mono font-medium")}>{c.number}</td>
                    <td className={tdClass}>
                      {can(user, "member.read") ? (
                        <Link href={`/${locale}/members/${c.user.id}`} className="font-medium hover:underline">
                          {c.user.name ?? c.user.email}
                        </Link>
                      ) : (
                        <span className="font-medium">{c.user.name ?? c.user.email}</span>
                      )}
                      <p className="text-[11.5px] text-subtle">{c.user.email}</p>
                    </td>
                    <td className={cx(tdClass, "max-w-[220px] truncate")} title={c.program.title}>
                      {c.program.title}
                    </td>
                    <td className={cx(tdClass, "tabular text-zinc-600")}>{formatDate(c.issuedAt)}</td>
                    <td className={cx(tdClass, "tabular text-zinc-600")}>
                      {c.expiresAt ? formatDate(c.expiresAt) : "영구"}
                      {soon && c.expiresAt && <span className="ml-1.5 text-[11.5px] font-medium text-amber-700">D-{daysUntil(c.expiresAt, now)}</span>}
                    </td>
                    <td className={tdClass}>
                      {c.revokedAt ? (
                        <Badge tone="red">취소 · {formatDate(c.revokedAt)}</Badge>
                      ) : expired ? (
                        <Badge tone="slate">만료</Badge>
                      ) : soon ? (
                        <Badge tone="amber" dot>
                          만료 임박
                        </Badge>
                      ) : (
                        <Badge tone="green" dot>
                          유효
                        </Badge>
                      )}
                    </td>
                    <td className={cx(tdClass, "tabular text-[12.5px] text-zinc-500")}>
                      {c.renewalNotifiedAt ? formatDate(c.renewalNotifiedAt) : <span className="text-subtle">-</span>}
                    </td>
                    <td className={cx(tdClass, "text-right")}>{!c.revokedAt && <RevokeButton id={c.id} number={c.number} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
