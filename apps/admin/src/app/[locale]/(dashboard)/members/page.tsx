import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { listMembers } from "@/lib/queries/admin";
import { getRoleDefs } from "@/lib/roles";
import { ROLES, ROLE_LABEL } from "@/lib/labels";
import { FilterChip, PageHeader, qs } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { MemberTable } from "@/components/members/MemberTable";
import { Pager } from "@/components/Pager";
import { SelectFilter } from "@/components/SelectFilter";

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; role?: string; org?: string; page?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("member.read", locale);
  const sp = await searchParams;
  const [data, roleDefs] = await Promise.all([listMembers({ ...sp, page: Number(sp.page) || 1 }), getRoleDefs()]);
  const customRoles = roleDefs.filter((r) => !r.isSystem);
  const base = `/${locale}/members`;
  const link = (patch: Record<string, string | undefined>) =>
    qs(base, { q: sp.q, status: sp.status, role: sp.role, org: sp.org, ...patch, page: undefined });
  const totalAll = (data.statusCounts.PENDING ?? 0) + (data.statusCounts.APPROVED ?? 0) + (data.statusCounts.REJECTED ?? 0);

  return (
    <>
      <PageHeader
        title="회원 · 수강"
        description="가입 신청을 승인·거절하고(기존 New User Approve 대체) 회원별 수강·수료 현황을 봅니다."
      />

      <div data-tour="member-filters">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox placeholder="이름·이메일 검색" />
        <SelectFilter
          param="role"
          label="역할"
          value={sp.role ?? ""}
          options={[
            { value: "", label: "모든 역할" },
            ...ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })),
            ...customRoles.map((r) => ({ value: r.key, label: r.name })),
          ]}
        />
        <SelectFilter
          param="org"
          label="소속"
          value={sp.org ?? ""}
          options={[
            { value: "", label: "사내·외부 전체" },
            { value: "internal", label: "사내 (바야다 조직)" },
            { value: "external", label: "외부" },
          ]}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip href={link({ status: undefined })} active={!sp.status} count={totalAll}>
          전체
        </FilterChip>
        <FilterChip href={link({ status: "PENDING" })} active={sp.status === "PENDING"} count={data.statusCounts.PENDING ?? 0}>
          승인 대기
        </FilterChip>
        <FilterChip href={link({ status: "APPROVED" })} active={sp.status === "APPROVED"} count={data.statusCounts.APPROVED ?? 0}>
          승인
        </FilterChip>
        <FilterChip href={link({ status: "REJECTED" })} active={sp.status === "REJECTED"} count={data.statusCounts.REJECTED ?? 0}>
          거절
        </FilterChip>
      </div>
      </div>

      <div data-tour="member-table">
      <MemberTable
        rows={data.rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        locale={locale}
        canWrite={can(user, "member.write")}
        selfId={user.id}
        roleNames={Object.fromEntries(customRoles.map((r) => [r.key, r.name]))}
      />
      </div>
      <Pager page={data.page} pages={data.pages} total={data.total} unit="명" />
    </>
  );
}
