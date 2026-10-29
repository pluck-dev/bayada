// 시스템 역할(AdminRoleDef) 시드 — 없는 행만 옛 하드코딩 MATRIX 값으로 만든다(이미 있으면 그대로, 여러 번 실행해도 안전).
// 어드민은 첫 조회 때 같은 일을 자동으로 하므로, 배포 직후 미리 채워 두고 싶을 때만 쓴다.
//   pnpm --filter ./apps/admin seed:roles   (DATABASE_URL 이 없으면 apps/admin/.env.local 을 읽는다)
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(import.meta.dirname, "../.env.local");
if (!process.env.DATABASE_URL && existsSync(envFile)) process.loadEnvFile(envFile);

const { prisma } = await import("@bayada/db");
const { ADMIN_ROLES, DEFAULT_ROLE_PERMISSIONS, SYSTEM_ROLE_DEFAULTS } = await import("../src/lib/rbac");

const res = await prisma.adminRoleDef.createMany({
  data: ADMIN_ROLES.map((key) => ({
    key,
    name: SYSTEM_ROLE_DEFAULTS[key].name,
    description: SYSTEM_ROLE_DEFAULTS[key].description,
    permissions: [...DEFAULT_ROLE_PERMISSIONS[key]],
    isSystem: true,
  })),
  skipDuplicates: true,
});
const rows = await prisma.adminRoleDef.findMany({ where: { isSystem: true }, select: { key: true, permissions: true } });
console.log(`시스템 역할 ${res.count}개 생성 (전체 ${rows.length}개)`);
for (const r of rows) console.log(`  ${r.key}: ${r.permissions.length}개 권한`);
await prisma.$disconnect();
