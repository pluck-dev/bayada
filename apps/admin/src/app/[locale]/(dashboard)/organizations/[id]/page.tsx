import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Users, Phone } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  type Column,
} from "@bayada/ui";
import { ROLE_LABELS } from "@bayada/shared";
import type { UserRole } from "@bayada/shared";
import { organizationService } from "@/lib/services";

interface MemberRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const memberColumns: Column<MemberRow>[] = [
  {
    key: "name",
    header: "이름",
    render: (row) => (
      <Link href={`/users/${row.id}`} className="font-medium text-[#ce0e2d] hover:underline">
        {row.name}
      </Link>
    ),
  },
  { key: "email", header: "이메일" },
  {
    key: "role",
    header: "역할",
    render: (row) => (
      <Badge variant={row.role === "ORG_ADMIN" ? "warning" : "info"}>
        {ROLE_LABELS[row.role]}
      </Badge>
    ),
  },
  { key: "createdAt", header: "가입일" },
];

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let org: Awaited<ReturnType<typeof organizationService.getById>>;
  let members: Awaited<ReturnType<typeof organizationService.getMembers>>;
  try {
    [org, members] = await Promise.all([
      organizationService.getById(id),
      organizationService.getMembers(id),
    ]);
  } catch {
    notFound();
  }

  const o = org as Record<string, unknown>;
  const _count = o._count as { users?: number; orders?: number } | undefined;

  const memberRows: MemberRow[] = members.map((m) => {
    const member = m as Record<string, unknown>;
    return {
      id: member.id as string,
      name: (member.name as string) ?? "-",
      email: member.email as string,
      role: member.role as UserRole,
      createdAt: new Date(member.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            {o.name as string}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            등록일: {new Date(o.createdAt as string).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--info-bg)]">
              <Users className="h-5 w-5 text-[color:var(--info)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">소속 인원</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">{_count?.users ?? 0}명</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--warning-bg)]">
              <Building2 className="h-5 w-5 text-[color:var(--warning)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">주문 수</p>
              <p className="text-lg font-bold text-[color:var(--fg)]">{_count?.orders ?? 0}건</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--success-bg)]">
              <Phone className="h-5 w-5 text-[color:var(--success)]" />
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">담당자 연락처</p>
              <p className="text-sm font-bold text-[color:var(--fg)]">{(o.contact as string) ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기관 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs text-[color:var(--muted)]">기관명</dt>
              <dd className="font-medium text-[color:var(--fg)]">{o.name as string}</dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--muted)]">사업자등록번호</dt>
              <dd className="font-medium text-[color:var(--fg)]">{(o.bizNo as string) ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--muted)]">담당자 연락처</dt>
              <dd className="font-medium text-[color:var(--fg)]">{(o.contact as string) ?? "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 소속 회원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>소속 회원 ({memberRows.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {memberRows.length > 0 ? (
            <DataTable<MemberRow> columns={memberColumns} data={memberRows} keyField="id" />
          ) : (
            <p className="py-8 text-center text-sm text-[color:var(--muted)]">
              소속 회원이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
