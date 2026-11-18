"use server";
import { prisma } from "@bayada/db";
import { revalidatePath } from "next/cache";
import { WEB_PAGE_PREFIX, WEB_PAGE_TITLES, isWebPageKey, parseWebPageContent } from "@bayada/shared/web-page-content";
import { ActionError, runAction } from "../session";
import { revalidateWeb } from "../web-revalidate";

export async function saveWebPage(key: string, input: unknown, baseUpdatedAt: string | null) {
  return runAction("web.content", async (user) => {
    if (!isWebPageKey(key)) throw new ActionError("관리할 수 없는 페이지입니다.");
    let content;
    try { content = JSON.stringify(parseWebPageContent(key, input)); } catch (e) { throw new ActionError(e instanceof Error ? e.message : "본문을 확인하세요."); }
    const slug = WEB_PAGE_PREFIX + key;
    await prisma.$transaction(async (tx) => {
      const before = await tx.page.findUnique({ where: { slug } });
      if (baseUpdatedAt !== null) {
        const timestamp = new Date(baseUpdatedAt);
        if (!Number.isFinite(timestamp.getTime())) throw new ActionError("편집 시점을 확인하세요.");
        const changed = await tx.page.updateMany({ where: { slug, updatedAt: timestamp }, data: { content, title: WEB_PAGE_TITLES[key] } });
        if (changed.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 편집하세요.");
      } else await tx.page.create({ data: { slug, title: WEB_PAGE_TITLES[key], content } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "web.page.save", target: slug, detail: { before: before?.content ?? null, after: content } } });
    });
    revalidatePath("/[locale]/(dashboard)/web/pages", "layout");
    return { message: `저장했습니다. ${await revalidateWeb()}` };
  });
}
export async function resetWebPage(key: string, baseUpdatedAt: string) {
  return runAction("web.content", async (user) => {
    if (!isWebPageKey(key)) throw new ActionError("관리할 수 없는 페이지입니다.");
    const timestamp = new Date(baseUpdatedAt);
    if (!Number.isFinite(timestamp.getTime())) throw new ActionError("편집 시점을 확인하세요.");
    const slug = WEB_PAGE_PREFIX + key;
    await prisma.$transaction(async (tx) => {
      const before = await tx.page.findUnique({ where: { slug } });
      const changed = await tx.page.deleteMany({ where: { slug, updatedAt: timestamp } });
      if (changed.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 확인하세요.");
      await tx.auditLog.create({ data: { actorId: user.id, action: "web.page.reset", target: slug, detail: { before: before?.content ?? null } } });
    });
    revalidatePath("/[locale]/(dashboard)/web/pages", "layout");
    return { message: `기본 내용으로 복원했습니다. ${await revalidateWeb()}` };
  });
}
