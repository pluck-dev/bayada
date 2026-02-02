import { Search, Plus, Building2, Users, BookOpen } from "lucide-react";
import {
  Button,
  Badge,
  DataTable,
  type Column,
  Input,
  Card,
  CardContent,
} from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { organizationService } from "@/lib/services";

interface OrgRow {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  members: number;
  enrollments: number;
  totalSpent: number;
  status: string;
  contractEnd: string;
  createdAt: string;
}

const columns: Column<OrgRow>[] = [
  {
    key: "name",
    header: "기관명",
    render: (row) => (
      <div>
        <p className="font-medium text-[color:var(--fg)]">{row.name}</p>
        <p className="text-xs text-[color:var(--muted)]">
          {row.contactName} ({row.contactEmail})
        </p>
      </div>
    ),
  },
  {
    key: "members",
    header: "소속 인원",
    render: (row) => `${row.members}명`,
  },
  {
    key: "enrollments",
    header: "수강 등록",
    render: (row) => `${row.enrollments}건`,
  },
  {
    key: "totalSpent",
    header: "누적 거래액",
    render: (row) => formatPrice(row.totalSpent),
  },
  {
    key: "contractEnd",
    header: "계약 만료일",
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge variant={row.status === "활성" ? "success" : "error"}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    render: () => (
      <Button variant="ghost" size="sm">
        상세
      </Button>
    ),
  },
];

export default async function OrganizationsPage() {
  const result = await organizationService.list({});

  const organizations: OrgRow[] = result.items.map((o) => {
    const org = o as Record<string, unknown>;
    const _count = org._count as { members?: number; orders?: number } | undefined;
    const stats = org as { totalSpent?: number };

    return {
      id: org.id as string,
      name: org.name as string,
      contactName: (org.contactName as string) ?? "-",
      contactEmail: (org.contactEmail as string) ?? "-",
      members: _count?.members ?? 0,
      enrollments: _count?.orders ?? 0,
      totalSpent: stats.totalSpent ?? 0,
      status: (org.isActive as boolean) !== false ? "활성" : "만료",
      contractEnd: org.contractEnd
        ? new Date(org.contractEnd as string).toLocaleDateString("ko-KR")
        : "-",
      createdAt: new Date(org.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

  const orgStats = {
    total: organizations.length,
    active: organizations.filter((o) => o.status === "활성").length,
    totalMembers: organizations.reduce((sum, o) => sum + o.members, 0),
    totalRevenue: organizations.reduce((sum, o) => sum + o.totalSpent, 0),
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--success-bg)]">
              <Building2 className="h-5 w-5 text-[color:var(--success)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">활성 기관</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">
                {orgStats.active}
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
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--warning-bg)]">
              <BookOpen className="h-5 w-5 text-[color:var(--warning)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">B2B 누적 매출</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">
                {formatPrice(orgStats.totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="기관명으로 검색..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            전체
          </Button>
          <Button variant="ghost" size="sm">
            활성
          </Button>
          <Button variant="ghost" size="sm">
            만료
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable<OrgRow> columns={columns} data={organizations} keyField="id" />

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          전체 {organizations.length}개 기관
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
