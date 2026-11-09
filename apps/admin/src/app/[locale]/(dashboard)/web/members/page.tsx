import Link from "next/link";
import { MEMBER_TYPES, MEMBER_TYPE_LABEL } from "@bayada/shared/member";
import { requirePage } from "@/lib/session";
import { listWebMembers, parseMemberFilter } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { MEMBER_TYPE_TONE } from "@/lib/web-labels";
import { Pager } from "@/components/Pager";
import { SearchBox } from "@/components/SearchBox";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";

type SP = { type?: string; q?: string; staff?: string; withdrawal?: string; page?: string };

export default async function WebMembersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  await requirePage("web.members", locale);
  const sp = await searchParams;
  const f = parseMemberFilter(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages, typeCounts, withdrawals } = await listWebMembers(f, page);
  const base = `/${locale}/web/members`;
  const all = Object.values(typeCounts).reduce((n, c) => n + (c ?? 0), 0);
  const keep = { q: f.q };

  return (
    <>
      <PageHeader
        title="홈페이지 회원"
        description="홈페이지 마이페이지를 쓰는 회원입니다. 아카데미와 같은 계정이라 아카데미 회원 정보는 '회원·수강'에서 봅니다. 제공자를 방문 인력으로 지정하면 예약 담당자로 배정할 수 있습니다."
      />
      <div data-tour="member-type" className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="회원 유형">
        <FilterChip href={qs(base, keep)} active={!f.type && !f.staff && !f.withdrawal} count={all}>
          전체
        </FilterChip>
        {MEMBER_TYPES.map((t) => (
          <FilterChip key={t} href={qs(base, { ...keep, type: t })} active={f.type === t && !f.staff} count={typeCounts[t] ?? 0}>
            {MEMBER_TYPE_LABEL[t]}
          </FilterChip>
        ))}
        <FilterChip href={qs(base, { ...keep, type: "PROVIDER", staff: "1" })} active={!!f.staff}>
          방문 인력
        </FilterChip>
        <FilterChip href={qs(base, { ...keep, withdrawal: "1" })} active={!!f.withdrawal} count={withdrawals}>
          탈퇴 요청
        </FilterChip>
      </div>
      <div className="mb-4 flex justify-end">
        <SearchBox placeholder="이름·이메일·휴대폰·기관명" />
      </div>
      <div data-tour="member-table" className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title={all === 0 ? "아직 홈페이지 회원이 없습니다" : "조건에 맞는 회원이 없습니다"} description="홈페이지 회원가입 또는 마이페이지 첫 방문 때 회원 유형을 고른 계정이 여기에 보입니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>이름</th>
                <th className={thClass}>유형</th>
                <th className={thClass}>연락처</th>
                <th className={thClass}>예약·문의</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>가입</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`${base}/${r.userId}`} className="font-bold text-ink transition-colors hover:text-brand">
                      {r.user.name ?? "-"}
                    </Link>
                    {(r.orgName || r.providerRole) && <p className="text-micro text-subtle">{r.orgName ?? r.providerRole}</p>}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={MEMBER_TYPE_TONE[r.memberType]}>{MEMBER_TYPE_LABEL[r.memberType]}</Badge>
                    {r.isVisitStaff && (
                      <Badge tone="brand" className="ml-1">
                        방문 인력
                      </Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>
                    <p className="tabular">{r.user.phone ?? "-"}</p>
                    <p className="text-micro text-subtle">
                      {r.user.email}
                      {r.user.emailVerifiedAt ? " · 인증" : ""}
                    </p>
                  </td>
                  <td className={cx(tdClass, "tabular text-muted")}>
                    예약 {r.user._count.bookingsAsPatient + r.user._count.bookingsAssigned} · 문의 {r.user._count.webInquiries}
                  </td>
                  <td className={tdClass}>
                    {r.withdrawnAt ? (
                      <Badge tone="slate">탈퇴</Badge>
                    ) : r.withdrawalRequestedAt ? (
                      <Badge tone="red" dot>
                        탈퇴 요청
                      </Badge>
                    ) : (
                      <Badge tone="green" dot>
                        이용 중
                      </Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-muted")}>{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={page} pages={pages} total={total} unit="명" />
    </>
  );
}
