import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@bayada/db";
import { auth } from "./auth";
import { can, homePath, isAdminRole, type AdminRole, type Permission } from "./rbac";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: AdminRole;
  /** PARTNER_ADMIN 이 관리하는 제공기관 (그 외 역할은 null) */
  providerId: string | null;
}

/**
 * 현재 어드민 사용자. JWT 의 role 은 로그인 시점 값이라
 * 매 요청 DB 에서 역할·상태를 다시 읽어 강등·거절이 즉시 반영되게 한다.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, providerId: true },
  });
  if (!user || user.status !== "APPROVED" || !isAdminRole(user.role)) return null;
  // 제공기관이 해제된 파트너 관리자는 볼 수 있는 게 없으므로 로그인 상태로 취급하지 않는다
  if (user.role === "PARTNER_ADMIN" && !user.providerId) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    providerId: user.role === "PARTNER_ADMIN" ? user.providerId : null,
  };
});

/** 페이지 가드 — 비로그인은 로그인으로, 권한 없으면 역할별 첫 화면으로 */
export async function requirePage(permission: Permission, locale: string): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect(`/${locale}/auth/login`);
  if (!can(user.role, permission)) redirect(homePath(user.role, locale));
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
  if (!perms.some((p) => can(user.role, p))) return { ok: false, error: "권한이 없습니다." };
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
