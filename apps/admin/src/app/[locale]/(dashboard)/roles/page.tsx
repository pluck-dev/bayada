import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { getRoleDefs } from "@/lib/roles";
import { PageHeader } from "@/components/ui";
import { RoleManager } from "@/components/roles/RoleManager";

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("role.manage", locale);
  const [roles, systemCounts, customCounts] = await Promise.all([
    getRoleDefs(),
    prisma.user.groupBy({ by: ["role"], where: { customRoleKey: null }, _count: true }),
    prisma.user.groupBy({ by: ["customRoleKey"], where: { customRoleKey: { not: null } }, _count: true }),
  ]);
  const counts: Record<string, number> = {
    ...Object.fromEntries(systemCounts.map((g) => [g.role, g._count])),
    ...Object.fromEntries(customCounts.map((g) => [g.customRoleKey as string, g._count])),
  };

  return (
    <>
      <PageHeader
        title="역할·권한"
        description="역할마다 어드민 메뉴·기능 권한을 정합니다. 저장하면 다음 화면 이동부터 바로 적용되고 감사 로그에 남습니다."
      />
      <RoleManager
        roles={roles.map((r) => ({ ...r, users: counts[r.key] ?? 0 }))}
        selfRoleKey={user.roleKey}
        locale={locale}
      />
    </>
  );
}
