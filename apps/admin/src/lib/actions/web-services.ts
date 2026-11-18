"use server";
import { prisma } from "@bayada/db";
import { revalidatePath } from "next/cache";
import { parseWebServiceDocument, WEB_SERVICE_PREFIX } from "@bayada/shared/web-services";
import { ActionError, runAction } from "../session";
import { revalidateWeb } from "../web-revalidate";

export async function saveWebService(input: unknown, baseUpdatedAt: string | null) {
  return runAction("web.content", async (user) => {
    let doc;
    try { doc = parseWebServiceDocument(input); } catch (e) { throw new ActionError(e instanceof Error ? e.message : "입력값을 확인하세요."); }
    const slug = WEB_SERVICE_PREFIX + doc.service.slug;
    await prisma.$transaction(async (tx) => {
      const data = { title: doc.service.nameKo, content: JSON.stringify(doc) };
      if (baseUpdatedAt !== null) {
        const timestamp = new Date(baseUpdatedAt);
        if (!Number.isFinite(timestamp.getTime())) throw new ActionError("편집 시점을 확인하세요.");
        const result = await tx.page.updateMany({ where: { slug, updatedAt: timestamp }, data });
        if (result.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 편집하세요.");
      } else await tx.page.create({ data: { slug, ...data } });
      await tx.auditLog.create({ data: { actorId: user.id, action: baseUpdatedAt ? "web.service.update" : "web.service.create", target: slug, detail: { published: doc.published, title: doc.service.nameKo } } });
    });
    revalidatePath("/[locale]/(dashboard)/web/services", "layout");
    return { message: `저장했습니다. ${await revalidateWeb()}` };
  });
}
export async function deleteWebService(slug: string, baseUpdatedAt: string) {
  return runAction("web.content", async (user) => {
    const key = WEB_SERVICE_PREFIX + slug;
    const timestamp = new Date(baseUpdatedAt);
    if (!Number.isFinite(timestamp.getTime())) throw new ActionError("편집 시점을 확인하세요.");
    await prisma.$transaction(async (tx) => {
      const result = await tx.page.deleteMany({ where: { slug: key, updatedAt: timestamp } });
      if (result.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 확인하세요.");
      await tx.auditLog.create({ data: { actorId: user.id, action: "web.service.delete", target: key } });
    });
    revalidatePath("/[locale]/(dashboard)/web/services", "layout");
    return { message: `삭제했습니다. ${await revalidateWeb()}` };
  });
}
