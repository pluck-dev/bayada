import { Plus, Building2, Users } from "lucide-react";
import {
  Button,
  DataTable,
  type Column,
  Card,
  CardContent,
} from "@bayada/ui";
import { organizationService } from "@/lib/services";
import { SearchFilter } from "@/components/SearchFilter";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";

interface OrgRow {
  [key: string]: unknown;
  id: string;
  name: string;
  bizNo: string;
  contact: string;
  members: number;
  orders: number;
  createdAt: string;
}

const columns: Column<OrgRow>[] = [
  {
    key: "name",
    header: "기관명",
    render: (row) => (
      <div>
        <p className="font-medium text-[color:var(--fg)]">{row.name}</p>
        {row.bizNo !== "-" && (
          <p className="text-xs text-[color:var(--muted)]">
            사업자번호: {row.bizNo}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "contact",
    header: "담당자 연락처",
  },
  {
    key: "members",
    header: "소속 인원",
    render: (row) => `${row.members}명`,
  },
  {
    key: "orders",
    header: "주문 수",
    render: (row) => `${row.orders}건`,
  },
  {
    key: "createdAt",
    header: "등록일",
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <Link href={`/organizations/${row.id}`}>
        <Button variant="ghost" size="sm">
          상세
        </Button>
      </Link>
    ),
  },
];

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? "";

  const result = await organizationService.list({
    page,
    limit: 20,
    search: search || undefined,
  });

  const organizations: OrgRow[] = result.items.map((o) => {
    const org = o as Record<string, unknown>;
    const _count = org._count as { users?: number; orders?: number } | undefined;

    return {
      id: org.id as string,
      name: org.name as string,
      bizNo: (org.bizNo as string) ?? "-",
      contact: (org.contact as string) ?? "-",
      members: _count?.users ?? 0,
      orders: _count?.orders ?? 0,
      createdAt: new Date(org.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

  const orgStats = {
    total: result.total,
    totalMembers: organizations.reduce((sum, o) => sum + o.members, 0),
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            기관 관리 (B2B)
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            B2B 기관 고객을 관리합니다.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 기관 등록
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fae6ea]">
              <Building2 className="h-5 w-5 text-[#ce0e2d]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">전체 기관</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">
                {orgStats.total}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--info-bg)]">
              <Users className="h-5 w-5 text-[color:var(--info)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">전체 소속 인원</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">
                {orgStats.totalMembers}명
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <SearchFilter searchPlaceholder="기관명으로 검색..." />

      {/* 데이터 테이블 */}
      <DataTable<OrgRow> columns={columns} data={organizations} keyField="id" />

      {/* 페이지네이션 */}
      <Pagination
        total={result.total}
        page={result.page}
        limit={result.pageSize}
        totalPages={result.totalPages}
        unit="개 기관"
      />
    </div>
  );
}
