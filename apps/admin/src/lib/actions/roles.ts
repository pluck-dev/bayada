"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { ALL_PERMISSIONS, effectivePermissions, isPermission, type Permission } from "../rbac";
import { ensureSystemRoles } from "../roles";

function done() {
  // 사이드바·페이지 가드가 모두 레이아웃 아래라 레이아웃 전체를 다시 그린다
  revalidatePath("/[locale]/(dashboard)", "layout");
}

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * 역할별 권한 저장. `base` 는 화면을 연 시점 값 — DB 가 그사이 바뀐 역할이 있으면 거부(동시 수정).
 * ADMIN 은 잠금(항상 전체)이라 무시하고, 고정 권한(파트너 콘솔)은 effectivePermissions 가 정리한다.
 */
export async function saveRolePermissions(next: Record<string, string[]>, base: Record<string, string[]>) {
  return runAction("role.manage", async (user) => {
    await ensureSystemRoles();
    const rows = await prisma.adminRoleDef.findMany({ select: { key: true, name: true, permissions: true } });
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const changes: { key: string; name: string; before: Permission[]; after: Permission[] }[] = [];
    for (const [key, perms] of Object.entries(next)) {
      if (key === "ADMIN") continue;
      const row = byKey.get(key);
      if (!row) throw new ActionError("삭제된 역할이 있습니다. 화면을 새로고침하세요.");
      if (!Array.isArray(perms) || !perms.every(isPermission)) throw new ActionError("권한 값이 올바르지 않습니다.");
      const before = effectivePermissions(key, row.permissions);
      if (!sameSet(before, effectivePermissions(key, base[key] ?? []))) {
        throw new ActionError(`다른 관리자가 '${row.name}' 권한을 먼저 바꿨습니다. 새로고침 후 다시 저장하세요.`);
      }
      const after = effectivePermissions(key, perms);
      if (!sameSet(before, after)) changes.push({ key, name: row.name, before, after });
    }
    if (!changes.length) return { message: "변경 사항이 없습니다." };
    // 역할·권한 화면 접근권(role.manage)을 본인 역할에서 빼면 저장 직후 이 화면에서 쫓겨난다 — 막는다
    const self = changes.find((c) => c.key === user.roleKey);
    if (self && !self.after.includes("role.manage")) {
      throw new ActionError("본인 역할에서 '역할·권한' 권한은 뺄 수 없습니다.");
    }
    await prisma.$transaction(
      changes.map((c) => prisma.adminRoleDef.update({ where: { key: c.key }, data: { permissions: c.after } })),
    );
    for (const c of changes) {
      await audit(user.id, "role.permissions", `AdminRole:${c.key}`, {
        role: c.name,
        before: c.before,
        after: c.after,
        added: c.after.filter((p) => !c.before.includes(p)),
        removed: c.before.filter((p) => !c.after.includes(p)),
      });
    }
    done();
    return { message: `${changes.length}개 역할의 권한을 저장했습니다.` };
  });
}

function cleanName(name: string) {
  const n = name.trim();
  if (!n) throw new ActionError("역할 이름을 입력하세요.");
  if (n.length > 40) throw new ActionError("역할 이름은 40자 이내로 입력하세요.");
  return n;
}

async function assertNameFree(name: string, exceptKey?: string) {
  const dup = await prisma.adminRoleDef.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, ...(exceptKey ? { key: { not: exceptKey } } : {}) },
    select: { key: true },
  });
  if (dup) throw new ActionError("같은 이름의 역할이 이미 있습니다.");
}

/** 사용자 정의 역할 생성 — 권한 없이 만들고 매트릭스에서 체크한다 (복사 원본을 고르면 그 권한으로 시작) */
export async function createRole(input: { name: string; description: string; copyFrom?: string }) {
  return runAction("role.manage", async (user) => {
    const name = cleanName(input.name);
    await assertNameFree(name);
    let permissions: Permission[] = [];
    if (input.copyFrom) {
      const src = await prisma.adminRoleDef.findUnique({ where: { key: input.copyFrom }, select: { key: true, permissions: true } });
      if (!src) throw new ActionError("복사할 역할을 찾을 수 없습니다.");
      // ADMIN 은 실효 전체 권한을 복사, 파트너 콘솔(고정 권한)은 빠진다
      permissions = effectivePermissions("custom", src.key === "ADMIN" ? ALL_PERMISSIONS : src.permissions);
    }
    const key = `custom_${randomBytes(4).toString("hex")}`;
    await prisma.adminRoleDef.create({
      data: { key, name, description: input.description.trim().slice(0, 200), permissions, isSystem: false },
    });
    await audit(user.id, "role.create", `AdminRole:${key}`, { name, permissions, copyFrom: input.copyFrom ?? null });
    done();
    return { message: `'${name}' 역할을 만들었습니다. 매트릭스에서 권한을 체크하고 저장하세요.` };
  });
}

export async function updateRole(key: string, input: { name: string; description: string }) {
  return runAction("role.manage", async (user) => {
    const row = await prisma.adminRoleDef.findUnique({ where: { key }, select: { name: true, description: true, isSystem: true } });
    if (!row) throw new ActionError("역할을 찾을 수 없습니다.");
    if (row.isSystem) throw new ActionError("시스템 역할의 이름은 바꿀 수 없습니다.");
    const name = cleanName(input.name);
    await assertNameFree(name, key);
    const description = input.description.trim().slice(0, 200);
    if (name === row.name && description === row.description) return { message: "변경 사항이 없습니다." };
    await prisma.adminRoleDef.update({ where: { key }, data: { name, description } });
    await audit(user.id, "role.update", `AdminRole:${key}`, {
      before: { name: row.name, description: row.description },
      after: { name, description },
    });
    done();
    return { message: "역할 정보를 바꿨습니다." };
  });
}

/** 사용자 정의 역할 삭제 — 지정된 회원이 한 명이라도 있으면 거부 (먼저 다른 역할로 옮긴다) */
export async function deleteRole(key: string) {
  return runAction("role.manage", async (user) => {
    const row = await prisma.adminRoleDef.findUnique({ where: { key }, select: { name: true, isSystem: true, permissions: true } });
    if (!row) throw new ActionError("역할을 찾을 수 없습니다.");
    if (row.isSystem) throw new ActionError("시스템 역할은 삭제할 수 없습니다.");
    const assigned = await prisma.user.count({ where: { customRoleKey: key } });
    if (assigned > 0) throw new ActionError(`이 역할이 지정된 회원 ${assigned}명이 있어 삭제할 수 없습니다. 먼저 다른 역할로 바꾸세요.`);
    await prisma.adminRoleDef.delete({ where: { key } });
    await audit(user.id, "role.delete", `AdminRole:${key}`, { name: row.name, permissions: row.permissions });
    done();
    return { message: `'${row.name}' 역할을 삭제했습니다.` };
  });
}
