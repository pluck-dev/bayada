import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma, type Role } from "@bayada/db";
import { auth } from "./auth";
import { can, homePath, isAdminRole, type Permission } from "./rbac";
import { getRoleDef, roleKeyOf } from "./roles";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  /** 시스템 역할 (사용자 정의 역할 사용자는 STUDENT). 파트너 소유권 등 역할 고유 규칙에만 쓴다 */
  role: Role;
  /** 실효 역할 키 — customRoleKey ?? role */
  roleKey: string;
  roleName: string;
  /** DB(AdminRoleDef)에서 읽은 실효 권한 — 권한 판정은 항상 이걸로 (can(user, …)) */
  permissions: Permission[];
  /** PARTNER_ADMIN 이 관리하는 제공기관 (그 외 역할은 null) */
  providerId: string | null;
}

/**
 * 현재 어드민 사용자. JWT 의 role 은 로그인 시점 값이라
 * 매 요청 DB 에서 역할·상태·역할 권한을 다시 읽어 강등·거절·권한 변경이 즉시 반영되게 한다.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, providerId: true, customRoleKey: true },
  });
  if (!user || user.status !== "APPROVED") return null;
  if (!user.customRoleKey && !isAdminRole(user.role)) return null;
  // 제공기관이 해제된 파트너 관리자는 볼 수 있는 게 없으므로 로그인 상태로 취급하지 않는다
  if (!user.customRoleKey && user.role === "PARTNER_ADMIN" && !user.providerId) return null;
  const def = await getRoleDef(roleKeyOf(user));
  // 삭제된 역할이거나 권한이 하나도 없으면 갈 곳이 없다 → 로그인 불가로 취급
  if (!def || def.permissions.length === 0) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleKey: def.key,
    roleName: def.name,
    permissions: def.permissions,
    providerId: user.role === "PARTNER_ADMIN" ? user.providerId : null,
  };
});

/** 페이지 가드 — 비로그인은 로그인으로, 권한 없으면 사용자별 첫 화면으로. 배열이면 그중 하나 */
export async function requirePage(permission: Permission | Permission[], locale: string): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect(`/${locale}/auth/login`);
  const perms = Array.isArray(permission) ? permission : [permission];
  if (!perms.some((p) => can(user, p))) redirect(homePath(user, locale));
  return user;
}

export class ActionError extends Error {}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string };

/** 서버 액션 가드 + 에러를 결과 객체로 변환 */
export async function runAction<T = undefined>(
  permission: Permission | Permission[],
  fn: (user: AdminUser) => Promise<{ message?: string; data?: T } | void>,
): Promise<ActionResult<T>> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };
  const perms = Array.isArray(permission) ? permission : [permission];
  if (!perms.some((p) => can(user, p))) return { ok: false, error: "권한이 없습니다." };
  try {
    const res = await fn(user);
    return { ok: true, ...(res ?? {}) };
  } catch (e) {
    if (e instanceof ActionError) return { ok: false, error: e.message };
    const code = (e as { code?: string }).code;
    if (code === "P2002") return { ok: false, error: "이미 사용 중인 값입니다 (slug·이름 중복)." };
    console.error(e);
    return { ok: false, error: "처리 중 오류가 발생했습니다." };
  }
}

export async function audit(
  actorId: string,
  action: string,
  target: string,
  detail?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { actorId, action, target, detail: detail === undefined ? undefined : (detail as object) },
  });
}
