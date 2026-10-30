import Link from "next/link";
import { requirePage } from "@/lib/session";
import { listOrganizations } from "@/lib/queries/organizations";
import { formatDate } from "@/lib/labels";
import { Badge, EmptyState, PageHeader, cx, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { NewOrganizationForm } from "@/components/organizations/OrgControls";

export default async function OrganizationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  await requirePage("commerce", locale);
  const { q } = await searchParams;
  const rows = await listOrganizations(q);
  const base = `/${locale}/organizations`;

  return (
    <>
      <PageHeader title="기관 (B2B)" description="기관 고객과 소속 직원, 기관 관리자, 과정 배정 현황을 관리합니다." />
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <SearchBox placeholder="기관명 검색" />
        <div className="ml-auto flex min-w-0 flex-1 justify-end">
          <NewOrganizationForm locale={locale} />
        </div>
      </div>

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState title={q ? "검색 결과가 없습니다" : "등록된 기관이 없습니다"} />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>기관명</th>
                <th className={thClass}>사업자등록번호</th>
                <th className={thClass}>담당자 연락처</th>
                <th className={cx(thClass, "text-right")}>소속 인원</th>
                <th className={cx(thClass, "text-right")}>대기 초대</th>
                <th className={cx(thClass, "text-right")}>과정 배정</th>
                <th className={cx(thClass, "text-right")}>주문</th>
                <th className={thClass}>등록일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`${base}/${o.id}`} className="font-medium hover:underline">
                      {o.name}
                    </Link>
                    {o.isInternal && (
                      <span className="ml-2">
                        <Badge tone="violet">사내</Badge>
                      </span>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-muted")}>{o.bizNo ?? "-"}</td>
                  <td className={cx(tdClass, "text-muted")}>{o.contact ?? "-"}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{o._count.users.toLocaleString()}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{o.invites.length}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{o._count.assignments.toLocaleString()}</td>
                  <td className={cx(tdClass, "tabular text-right")}>{o._count.orders}</td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-2 text-caption text-muted">{rows.length}개 기관</p>
    </>
  );
}
