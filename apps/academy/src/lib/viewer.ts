import { cache } from "react";
import { prisma } from "@bayada/db";
import type { JobRole, Role } from "@bayada/db";
import { auth } from "@/lib/auth";

export interface Viewer {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  jobRole: JobRole | null;
  organizationId: string | null;
  organizationName: string | null;
  /** 사내 조직 소속이면 INTERNAL 강의 열람 가능 */
  isInternal: boolean;
}

/**
 * 현재 로그인 사용자. JWT 에는 조직 정보가 id 뿐이라 isInternal 은 DB 에서 읽는다.
 * (조직 권한을 관리자가 바꾸면 재로그인 없이 바로 반영되도록)
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      jobRole: true,
      organizationId: true,
      organization: { select: { name: true, isInternal: true } },
    },
  });
  if (!user || user.status !== "APPROVED") return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jobRole: user.jobRole,
    organizationId: user.organizationId,
    organizationName: user.organization?.name ?? null,
    isInternal: user.organization?.isInternal ?? false,
  };
});
