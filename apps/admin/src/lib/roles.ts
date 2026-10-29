// 역할 정의 읽기 (서버 전용). 요청마다 한 번만 DB 를 읽고(React cache), 저장 시 revalidatePath 로 화면을 다시 그린다.
// 프로세스 메모리 캐시는 두지 않는다 — 인스턴스가 여러 개면 저장 직후 다른 인스턴스가 옛 권한을 계속 쓰기 때문.
import { cache } from "react";
import { prisma } from "@bayada/db";
import {
  ADMIN_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_ROLE_DEFAULTS,
  effectivePermissions,
  type Permission,
} from "./rbac";

export interface RoleDef {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
}

/**
 * 시스템 역할 행이 없으면 기본값(옛 하드코딩 MATRIX)으로 만든다. 이미 있는 행은 건드리지 않아 여러 번 불러도 안전하다.
 * 첫 조회 때 자동 실행 + `pnpm --filter ./apps/admin seed:roles` 스크립트.
 */
export async function ensureSystemRoles(): Promise<number> {
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
  return res.count;
}

const SYSTEM_ORDER = new Map<string, number>(ADMIN_ROLES.map((k, i) => [k, i]));

/** 전체 역할 (시스템 → 사용자 정의 생성순) — 요청당 1회 */
export const getRoleDefs = cache(async (): Promise<RoleDef[]> => {
  let rows = await prisma.adminRoleDef.findMany({ orderBy: { createdAt: "asc" } });
  if (rows.filter((r) => r.isSystem).length < ADMIN_ROLES.length) {
    await ensureSystemRoles();
    rows = await prisma.adminRoleDef.findMany({ orderBy: { createdAt: "asc" } });
  }
  return rows
    .map((r) => ({
      key: r.key,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      permissions: effectivePermissions(r.key, r.permissions),
    }))
    .sort((a, b) => (SYSTEM_ORDER.get(a.key) ?? 99) - (SYSTEM_ORDER.get(b.key) ?? 99));
});

export async function getRoleDef(key: string): Promise<RoleDef | null> {
  return (await getRoleDefs()).find((r) => r.key === key) ?? null;
}

/** 사용자의 실효 역할 키 — 사용자 정의 역할이 있으면 그것, 아니면 시스템 역할 */
export function roleKeyOf(user: { role: string; customRoleKey: string | null }): string {
  return user.customRoleKey ?? user.role;
}

/** 역할 키 → 표시 이름 (회원 목록 등). 모르는 키는 그대로 */
export async function roleNameMap(): Promise<Record<string, string>> {
  return Object.fromEntries((await getRoleDefs()).map((r) => [r.key, r.name]));
}
