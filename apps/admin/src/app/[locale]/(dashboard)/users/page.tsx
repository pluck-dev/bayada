import { Search, Download } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import { ROLE_LABELS } from "@bayada/shared";
import type { UserRole } from "@bayada/shared";

// 플레이스홀더 데이터
const users = [
  {
    id: "1",
    name: "김영희",
    email: "kim.yh@example.com",
    role: "STUDENT" as UserRole,
    organization: null,
    enrollments: 3,
    status: "활성",
    createdAt: "2024-08-15",
  },
  {
    id: "2",
    name: "박민수",
    email: "park.ms@example.com",
    role: "STUDENT" as UserRole,
    organization: null,
    enrollments: 5,
    status: "활성",
    createdAt: "2024-07-22",
  },
  {
    id: "3",
    name: "이수진",
    email: "lee.sj@example.com",
    role: "STUDENT" as UserRole,
    organization: null,
    enrollments: 2,
    status: "활성",
    createdAt: "2024-11-05",
  },
  {
    id: "4",
    name: "최관리",
    email: "choi.admin@bayada.co.kr",
    role: "ADMIN" as UserRole,
    organization: null,
    enrollments: 0,
    status: "활성",
    createdAt: "2024-01-10",
  },
  {
    id: "5",
    name: "정하은",
    email: "jung.he@healthcorp.kr",
    role: "ORG_ADMIN" as UserRole,
    organization: "(주)헬스케어코리아",
    enrollments: 0,
    status: "활성",
    createdAt: "2024-09-01",
  },
  {
    id: "6",
    name: "한도윤",
    email: "han.dy@example.com",
    role: "STUDENT" as UserRole,
    organization: null,
    enrollments: 1,
    status: "비활성",
    createdAt: "2024-05-18",
  },
  {
    id: "7",
    name: "장현우",
    email: "jang.hw@medilab.kr",
    role: "ORG_ADMIN" as UserRole,
    organization: "(주)메디랩",
    enrollments: 0,
    status: "활성",
    createdAt: "2024-10-12",
  },
  {
    id: "8",
    name: "윤지민",
    email: "yoon.jm@example.com",
    role: "STUDENT" as UserRole,
    organization: "(주)헬스케어코리아",
    enrollments: 4,
    status: "활성",
    createdAt: "2024-12-03",
  },
];

type UserRow = (typeof users)[number];

const roleBadgeVariant: Record<UserRole, "default" | "info" | "warning"> = {
  ADMIN: "default",
  STUDENT: "info",
  ORG_ADMIN: "warning",
};

const columns: Column<UserRow>[] = [
  {
    key: "name",
    header: "이름",
    render: (row) => (
      <div>
        <p className="font-medium text-[color:var(--fg)]">{row.name}</p>
        <p className="text-xs text-[color:var(--muted)]">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "역할",
    render: (row) => (
      <Badge variant={roleBadgeVariant[row.role]}>
        {ROLE_LABELS[row.role]}
      </Badge>
    ),
  },
  {
    key: "organization",
    header: "소속 기관",
    render: (row) => (
      <span className={row.organization ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]"}>
        {row.organization ?? "-"}
      </span>
    ),
  },
  {
    key: "enrollments",
    header: "수강 수",
    render: (row) => `${row.enrollments}개`,
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge variant={row.status === "활성" ? "success" : "secondary"}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "가입일",
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

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            회원 관리
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            전체 회원을 조회하고 관리합니다.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          엑셀 다운로드
        </Button>
      </div>

      {/* 필터/검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="이름 또는 이메일로 검색..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            전체
          </Button>
          <Button variant="ghost" size="sm">
            수강생
          </Button>
          <Button variant="ghost" size="sm">
            기관 관리자
          </Button>
          <Button variant="ghost" size="sm">
            관리자
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable<UserRow> columns={columns} data={users} keyField="id" />

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          전체 {users.length}명
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
