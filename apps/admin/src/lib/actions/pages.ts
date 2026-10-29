"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { pageDoc } from "../pages";

export interface PageInput {
  title: string;
  content: string;
  /** 편집을 시작한 시점의 최종 수정일 — 그 사이 다른 관리자가 저장했으면 덮어쓰지 않는다 */
  baseUpdatedAt: string | null;
}

export async function savePage(slug: string, input: PageInput) {
  return runAction<{ updatedAt: string }>("pages", async (user) => {
    const doc = pageDoc(slug);
    if (!doc) throw new ActionError("관리할 수 없는 문서입니다.");
    const title = input.title.trim();
    if (!title) throw new ActionError("문서 제목을 입력하세요.");
    const content = input.content.trim();
    if (!content) throw new ActionError("본문을 입력하세요.");
    // 본문은 학습자 화면에 HTML 로 그대로 나간다 — 스크립트 실행 경로는 받지 않는다
    if (/<script\b|<iframe\b|javascript:|\son[a-z]+\s*=/i.test(content)) {
      throw new ActionError("본문에 스크립트·iframe·이벤트 속성(onclick 등)은 넣을 수 없습니다.");
    }

    const before = await prisma.page.findUnique({ where: { slug }, select: { id: true, content: true, updatedAt: true } });
    if (before && input.baseUpdatedAt && before.updatedAt.toISOString() !== input.baseUpdatedAt) {
      throw new ActionError("편집하는 동안 다른 관리자가 이 문서를 저장했습니다. 새로고침 후 다시 수정하세요.");
    }
    if (!before && input.baseUpdatedAt) throw new ActionError("문서가 삭제되었습니다. 새로고침하세요.");

    const page = before
      ? await prisma.page.update({ where: { slug }, data: { title, content } })
      : await prisma.page.create({ data: { slug, title, content } });
    await audit(user.id, before ? "page.update" : "page.create", `Page:${page.id}`, {
      slug,
      title,
      chars: { from: before?.content.length ?? 0, to: content.length },
    });
    revalidatePath("/[locale]/(dashboard)/pages", "layout");
    return { message: before ? "저장했습니다." : `${doc.title} 문서를 만들었습니다.`, data: { updatedAt: page.updatedAt.toISOString() } };
  });
}
