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

// 플레이스홀더 데이터
const organizations = [
  {
    id: "1",
    name: "(주)헬스케어코리아",
    contactName: "정하은",
    contactEmail: "jung@healthcorp.kr",
    members: 45,
    enrollments: 128,
    totalSpent: 15_200_000,
    status: "활성",
    contractEnd: "2025-12-31",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    name: "(주)메디랩",
    contactName: "장현우",
    contactEmail: "jang@medilab.kr",
    members: 120,
    enrollments: 340,
    totalSpent: 42_000_000,
    status: "활성",
    contractEnd: "2025-09-30",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "서울대병원",
    contactName: "김대표",
    contactEmail: "kim@snuh.org",
    members: 230,
    enrollments: 580,
    totalSpent: 68_500_000,
    status: "활성",
    contractEnd: "2026-06-30",
    createdAt: "2023-11-01",
  },
  {
    id: "4",
    name: "(주)케어플러스",
    contactName: "박담당",
    contactEmail: "park@careplus.kr",
    members: 18,
    enrollments: 36,
    totalSpent: 5_400_000,
    status: "만료",
    contractEnd: "2025-01-31",
    createdAt: "2024-06-10",
  },
  {
    id: "5",
    name: "연세의료원",
    contactName: "이담당",
    contactEmail: "lee@yonsei.ac.kr",
    members: 85,
    enrollments: 210,
    totalSpent: 28_000_000,
    status: "활성",
    contractEnd: "2025-08-15",
    createdAt: "2024-02-28",
  },
];

type OrgRow = (typeof organizations)[number];

const orgStats = {
  total: organizations.length,
  active: organizations.filter((o) => o.status === "활성").length,
  totalMembers: organizations.reduce((sum, o) => sum + o.members, 0),
  totalRevenue: organizations.reduce((sum, o) => sum + o.totalSpent, 0),
};

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

export default function OrganizationsPage() {
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
