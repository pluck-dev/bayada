import { Search, Download } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import { ROLE_LABELS } from "@bayada/shared";
import type { UserRole } from "@bayada/shared";
import { userService } from "@/lib/services";

interface UserRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string | null;
  enrollments: number;
  status: string;
  createdAt: string;
}

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

export default async function UsersPage() {
  const result = await userService.list({});

  const users: UserRow[] = result.items.map((u) => {
    const user = u as Record<string, unknown>;
    const org = user.organization as { name: string } | null;
    const _count = user._count as { enrollments?: number } | undefined;

    return {
      id: user.id as string,
      name: (user.name as string) ?? "-",
      email: user.email as string,
      role: user.role as UserRole,
      organization: org?.name ?? null,
      enrollments: _count?.enrollments ?? 0,
      status: "활성",
      createdAt: new Date(user.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

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
