"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import type { JobRole } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { JOB_ROLES } from "@/lib/labels";

export type ProfileState = { ok?: boolean; error?: string };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "로그인이 필요합니다" };
  const name = String(formData.get("name") ?? "").trim();
  const jobRoleRaw = String(formData.get("jobRole") ?? "");
  if (!name || name.length > 40) return { error: "이름은 1~40자로 입력해 주세요" };
  const jobRole = [...JOB_ROLES, "OTHER"].includes(jobRoleRaw) ? (jobRoleRaw as JobRole) : null;
  await prisma.user.update({ where: { id: viewer.id }, data: { name, jobRole } });
  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}
