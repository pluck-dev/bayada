"use server";
import { prisma } from "@bayada/db";
import { parseEdits, parsePost, parseMenu, parsePartners, parseInquirySettings, KOREA_PREFIX } from "@bayada/korea";
import { pages, templates, documentSlug, cleanRichText } from "@bayada/korea/server";
import { revalidatePath } from "next/cache";
import { ActionError, runAction } from "../session";

async function mutate(slug: string, title: string, content: string | null, base: string | null, actorId: string, action: string) {
  await prisma.$transaction(async tx => {
    const before = await tx.page.findUnique({ where: { slug } });
    if (base !== null) {
      const date = new Date(base);
      if (!Number.isFinite(date.getTime())) throw new ActionError("편집 시점을 확인하세요.");
      const result = content === null ? await tx.page.deleteMany({ where: { slug, updatedAt: date } }) : await tx.page.updateMany({ where: { slug, updatedAt: date }, data: { title, content } });
      if (result.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 편집하세요.");
    } else {
      if (before || content === null) throw new ActionError("새로고침 후 다시 편집하세요.");
      await tx.page.create({ data: { slug, title, content } });
    }
    await tx.auditLog.create({ data: { actorId, action, target: slug, detail: { before: before?.content ?? null, after: content } } });
  });
  revalidatePath("/[locale]/(dashboard)/korea", "layout");
}
export async function saveKoreaPage(key: string, input: unknown, base: string | null) {
  return runAction("korea.content", async user => {
    const template = pages.find(p => p.key === key) || templates.fragments[key];
    if (!template) throw new ActionError("편집할 수 없는 페이지입니다.");
    let data;
    try { data = parseEdits(input, template); } catch (e) { throw new ActionError(e instanceof Error ? e.message : "입력값을 확인하세요."); }
    await mutate(documentSlug(key), data.title, JSON.stringify(data), base, user.id, "korea.page.save");
    return { message: "저장했습니다. 바야다코리아 홈페이지에 바로 반영됩니다." };
  });
}
export async function saveKoreaMenu(input: unknown, base: string | null) {
  return runAction("korea.content", async user => {
    let items;
    try { items = parseMenu(input); } catch(e) { throw new ActionError(e instanceof Error ? e.message : "메뉴를 확인하세요."); }
    await mutate("korea/navigation", "바야다코리아 메뉴", JSON.stringify(items), base, user.id, "korea.menu.save");
    return { message: "메뉴를 저장했습니다." };
  });
}
export async function saveKoreaPartners(input: unknown, base: string | null) {
  return runAction('korea.content', async user => {
    let items;
    try { items = parsePartners(input); } catch(e) { throw new ActionError(e instanceof Error ? e.message : '협력기관을 확인하세요.'); }
    await mutate('korea/partners', '바야다코리아 협력기관', JSON.stringify(items), base, user.id, 'korea.partners.save');
    return { message: '협력기관을 저장했습니다.' };
  });
}
export async function saveKoreaInquirySettings(input: unknown, base: string | null) {
  return runAction('korea.inquiries', async user => {
    let value;
    try { value = parseInquirySettings(input); } catch(e) { throw new ActionError(e instanceof Error ? e.message : '설정을 확인하세요.'); }
    await prisma.$transaction(async tx => {
      const key = 'korea.inquiry.settings';
      const before = await tx.siteSetting.findUnique({ where: { key } });
      if (base !== null) {
        const result = await tx.siteSetting.updateMany({ where: { key, updatedAt: new Date(base) }, data: { value } });
        if (result.count !== 1) throw new ActionError('다른 관리자가 변경했습니다. 새로고침 후 저장하세요.');
      } else { if (before) throw new ActionError('새로고침 후 저장하세요.'); await tx.siteSetting.create({ data: { key, value } }); }
      await tx.auditLog.create({ data: { actorId: user.id, action: 'korea.inquiry.settings', target: key, detail: { before: before?.value ?? null, after: value } } });
    });
    revalidatePath('/[locale]/(dashboard)/korea/settings', 'page');
    return { message: '접수·알림 설정을 저장했습니다.' };
  });
}
export async function resetKoreaPage(key: string, base: string) {
  return runAction("korea.content", async user => {
    if (!pages.some(p => p.key === key) && !templates.fragments[key]) throw new ActionError("편집할 수 없는 페이지입니다.");
    await mutate(documentSlug(key), key, null, base, user.id, "korea.page.reset");
    return { message: "원본 백업 내용으로 복원했습니다." };
  });
}
export async function saveKoreaPost(input: unknown, base: string | null) {
  return runAction("korea.content", async user => {
    let data;
    try { data = parsePost(input); } catch (e) { throw new ActionError(e instanceof Error ? e.message : "게시글을 확인하세요."); }
    data.content = cleanRichText(data.content);
    await mutate(`${KOREA_PREFIX}post/${data.board}/${data.id}`, data.title, JSON.stringify(data), base, user.id, "korea.post.save");
    return { message: "게시글을 저장했습니다." };
  });
}
export async function deleteKoreaPost(board: string, id: string, base: string) {
  return runAction("korea.content", async user => {
    try { parsePost({ id, board, title: "확인", content: "", author: "관리자", date: "2026-01-01", published: false, notice: false, image: "", attachments: [] }); } catch { throw new ActionError("게시글을 확인하세요."); }
    await mutate(`${KOREA_PREFIX}post/${board}/${id}`, id, null, base, user.id, "korea.post.delete");
    await prisma.siteSetting.deleteMany({ where: { key: 'korea.views.' + board + '.' + id } });
    return { message: "게시글을 삭제했습니다." };
  });
}
export async function processKoreaInquiry(slug: string, status: string, note: string, base: string, remove = false) {
  return runAction("korea.inquiries", async user => {
    if (!/^korea\/inquiry\/[a-f0-9]{64}\/[a-f0-9-]{36}$/.test(slug) || !["NEW", "IN_PROGRESS", "DONE"].includes(status) || typeof note !== "string" || note.length > 3000) throw new ActionError("처리 내용을 확인하세요.");
    const row = await prisma.page.findUnique({ where: { slug } });
    if (!row) throw new ActionError("문의를 찾을 수 없습니다.");
    const data = JSON.parse(row.content);
    data.status = status;
    if (note.trim()) data.notes.push({ text: note.trim(), actorId: user.id, at: new Date().toISOString() });
    // Inquiry deletion should not copy personal information into a permanent audit log.
    await prisma.$transaction(async tx => {
      const where = { slug, updatedAt: new Date(base) };
      const changed = remove ? await tx.page.deleteMany({ where }) : await tx.page.updateMany({ where, data: { content: JSON.stringify(data) } });
      if (changed.count !== 1) throw new ActionError("다른 관리자가 변경했습니다. 새로고침 후 다시 확인하세요.");
      if (remove) await tx.page.deleteMany({ where: { slug: 'korea/delivery/' + data.id } });
      await tx.auditLog.create({ data: { actorId: user.id, action: remove ? "korea.inquiry.delete" : "korea.inquiry.process", target: data.id, detail: { reference: data.reference, status, noteAdded: Boolean(note.trim()) } } });
    });
    revalidatePath("/[locale]/(dashboard)/korea/inquiries", "page");
    return { message: remove ? "문의를 삭제했습니다." : "처리 내용을 저장했습니다." };
  });
}
