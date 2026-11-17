import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";
import { passwordError } from "@bayada/shared/password-policy";
import { verifyPassword } from "@bayada/shared/password";
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from "@bayada/services/account";
import { WorkspaceError, type WorkspaceActor } from "./transition";

export const PROJECT_CLIENT_ROLE = "custom_project_client";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createProjectInvitation(email: string, actor: WorkspaceActor) {
  if (!actor.isAdmin) throw new WorkspaceError(403, "고객 초대는 최고 관리자만 할 수 있습니다.");
  const normalized = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) throw new WorkspaceError(400, "초대할 이메일을 확인하세요.");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invitation = await prisma.$transaction(async (tx) => {
    await tx.adminRoleDef.upsert({
      where: { key: PROJECT_CLIENT_ROLE }, update: {},
      create: { key: PROJECT_CLIENT_ROLE, name: "고객사 프로젝트 협의", description: "프로젝트 협의 메뉴만 접근", permissions: ["project.workspace"] },
    });
    const row = await tx.projectWorkspaceInvite.create({ data: { tokenHash: digest(token), email: normalized, invitedBy: actor.id, expiresAt } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "project.invite.create", target: `ProjectInvite:${row.id}`, detail: { email: normalized, expiresAt: expiresAt.toISOString() } } });
    return row;
  });
  return { id: invitation.id, token, expiresAt };
}

export async function projectInvitation(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return prisma.projectWorkspaceInvite.findFirst({ where: { tokenHash: digest(token), acceptedAt: null, expiresAt: { gt: new Date() } } });
}

export async function acceptProjectInvitation(token: string, input: { email: string; name: string; password: string }, ip: string) {
  const invitation = await projectInvitation(token);
  if (!invitation) throw new WorkspaceError(410, "만료되었거나 사용된 초대입니다.");
  const email = String(input.email || "").trim().toLowerCase();
  const name = String(input.name || "").trim();
  const password = input.password;
  if (email !== invitation.email || !name || name.length > 100 || typeof password !== "string" || password.length > 200) throw new WorkspaceError(400, "초대 이메일과 이름·비밀번호를 확인하세요.");
  if (await isLoginLocked(email, ip)) throw new WorkspaceError(429, "로그인 시도가 반복됐습니다. 15분 후 다시 시도하세요.");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const verified = await verifyPassword(password, existing.password);
    if (!verified.valid) { await recordLoginFailure(email, ip); throw new WorkspaceError(400, "기존 계정의 비밀번호를 확인하세요."); }
    if (existing.status !== "APPROVED") throw new WorkspaceError(403, "승인된 계정으로만 초대를 수락할 수 있습니다.");
    if (existing.role !== "STUDENT" || (existing.customRoleKey && existing.customRoleKey !== PROJECT_CLIENT_ROLE)) {
      throw new WorkspaceError(409, "운영 역할이 있는 계정입니다. 관리자가 해당 역할을 먼저 확인해야 합니다.");
    }
  } else {
    const error = passwordError(password);
    if (error) throw new WorkspaceError(400, error);
  }
  const passwordHash = existing ? null : await hash(password, 12);
  const acceptedAt = new Date();
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.projectWorkspaceInvite.updateMany({
      where: { id: invitation.id, acceptedAt: null, expiresAt: { gt: acceptedAt } }, data: { acceptedAt },
    });
    if (claimed.count !== 1) throw new WorkspaceError(409, "이미 사용되었거나 만료된 초대입니다.");
    let userId: string;
    if (existing) {
      const updated = await tx.user.updateMany({
        where: { id: existing.id, password: existing.password, role: "STUDENT", status: "APPROVED", customRoleKey: existing.customRoleKey },
        data: { customRoleKey: PROJECT_CLIENT_ROLE },
      });
      if (!updated.count) throw new WorkspaceError(409, "계정이 변경되었습니다. 다시 확인하세요.");
      userId = existing.id;
    } else {
      const user = await tx.user.create({ data: { email, name, password: passwordHash!, role: "STUDENT", status: "APPROVED", customRoleKey: PROJECT_CLIENT_ROLE } });
      userId = user.id;
    }
    await tx.projectWorkspaceInvite.update({ where: { id: invitation.id }, data: { acceptedBy: userId } });
    await tx.auditLog.create({ data: { actorId: userId, action: "project.invite.accept", target: `ProjectInvite:${invitation.id}`, detail: { invitedBy: invitation.invitedBy, role: PROJECT_CLIENT_ROLE } } });
  });
  await clearLoginFailures(email, ip);
}
