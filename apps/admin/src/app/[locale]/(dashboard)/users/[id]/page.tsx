import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, BookOpen, ShoppingCart } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
import { ROLE_LABELS } from "@bayada/shared";
import type { UserRole } from "@bayada/shared";
import { userService } from "@/lib/services";

const roleBadgeVariant: Record<UserRole, "default" | "info" | "warning"> = {
  ADMIN: "default",
  STUDENT: "info",
  ORG_ADMIN: "warning",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user: Awaited<ReturnType<typeof userService.getById>>;
  try {
    user = await userService.getById(id);
  } catch {
    notFound();
  }

  const u = user as Record<string, unknown>;
  const org = u.organization as { id: string; name: string } | null;
  const _count = u._count as { enrollments?: number; orders?: number } | undefined;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[color:var(--fg)]">
              {(u.name as string) ?? "-"}
            </h1>
            <Badge variant={roleBadgeVariant[u.role as UserRole]}>
              {ROLE_LABELS[u.role as string]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            가입일: {new Date(u.createdAt as string).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                <div>
                  <dt className="text-xs text-[color:var(--muted)]">이메일</dt>
                  <dd className="text-sm font-medium text-[color:var(--fg)]">
                    {u.email as string}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                <div>
                  <dt className="text-xs text-[color:var(--muted)]">전화번호</dt>
                  <dd className="text-sm font-medium text-[color:var(--fg)]">
                    {(u.phone as string) ?? "-"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                <div>
                  <dt className="text-xs text-[color:var(--muted)]">소속 기관</dt>
                  <dd className="text-sm font-medium text-[color:var(--fg)]">
                    {org ? (
                      <Link href={`/organizations/${org.id}`} className="text-[#ce0e2d] hover:underline">
                        {org.name}
                      </Link>
                    ) : "-"}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 통계 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--info-bg)]">
                <BookOpen className="h-5 w-5 text-[color:var(--info)]" />
              </div>
              <div>
                <p className="text-xs text-[color:var(--muted)]">수강 중</p>
                <p className="text-lg font-bold text-[color:var(--fg)]">
                  {_count?.enrollments ?? 0}개
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--warning-bg)]">
                <ShoppingCart className="h-5 w-5 text-[color:var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-[color:var(--muted)]">주문 수</p>
                <p className="text-lg font-bold text-[color:var(--fg)]">
                  {_count?.orders ?? 0}건
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
