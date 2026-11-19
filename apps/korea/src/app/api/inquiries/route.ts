import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@bayada/db";
import { getInquirySettings } from '@bayada/korea/server';
import { escapeHtml, validateInquiryFields } from '@bayada/korea';
import { sendMail } from '@bayada/services/account';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (message: string, status = 400, extra: { field?: string; reference?: string } = {}) => Response.json({ message, ...extra }, { status, headers: { "cache-control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expectedOrigin = `${request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)}://${request.headers.get("host") || url.host}`;
  if (!origin || origin !== expectedOrigin || request.headers.get("sec-fetch-site") === "cross-site") return reply("요청 출처를 확인하세요.", 403);
  if (Number(request.headers.get("content-length")) > 30000) return reply("입력 내용이 너무 깁니다.", 413);
  let x: Record<string, unknown>;
  try {
    const reader = request.body?.getReader(); if (!reader) return reply("입력값을 확인하세요.");
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 30000) { await reader.cancel(); return reply("입력 내용이 너무 깁니다.", 413); } chunks.push(part.value); }
    x = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return reply("입력값을 확인하세요."); }
  if (!x || typeof x !== "object" || Array.isArray(x)) return reply("입력값을 확인하세요.");
  if (x.website) return reply("접수가 완료되었습니다.", 200);
  if (x.privacyConsent !== true) return reply("개인정보 수집·이용에 동의해 주세요.", 400, { field: 'privacyConsent' });
  const value = (key: string, length: number) => typeof x[key] === "string" ? (x[key] as string).trim().slice(0, length) : "";
  const validated = validateInquiryFields(x);
  if (!validated.ok) return reply(validated.message, 400, { field: validated.field });
  const { name, phone, title, message, formType, email, position, contact, contactType } = validated.data;
  const { settings } = await getInquirySettings();
  if (!settings.enabled) return reply('현재 온라인 접수를 받지 않습니다. 전화로 문의해 주세요.', 503);
  const ipHash = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").digest("hex");
  const prefix = "korea/inquiry/" + ipHash + "/";
  try {
    const id = randomUUID();
    const reference = "KR-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + id.slice(0, 8).toUpperCase();
    const accepted = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${prefix}))`;
      const count = await tx.page.count({ where: { slug: { startsWith: prefix }, updatedAt: { gte: new Date(Date.now() - 600000) } } });
      if (count >= 5) return false;
      const content = { id, reference, formType, name, contact, contactType, phone, email, position, title, message, location: value("location", 200), services: Array.isArray(x.services) ? x.services.filter(s => typeof s === "string").slice(0, 10).map(s => String(s).slice(0, 100)) : [], privacyConsent: true, receivedAt: new Date().toISOString(), status: "NEW", notes: [] };
      await tx.page.create({ data: { slug: prefix + id, title: reference, content: JSON.stringify(content) } });
      return true;
    });
    if (!accepted) return reply("짧은 시간에 너무 많이 접수되었습니다. 잠시 후 다시 시도해 주세요.", 429);
    const recipients = formType === 'CAREERS' ? settings.careersRecipients : settings.consultationRecipients;
    let delivery = 'NOT_CONFIGURED';
    if (recipients.length && process.env.SMTP_URL && process.env.MAIL_FROM) {
      delivery = 'SENT';
      const text = [`접수번호: ${reference}`, `유형: ${formType === 'CAREERS' ? '채용' : '서비스 상담'}`, `이름: ${name}`, `연락처: ${contact}`, `이메일: ${email}`, `지원 분야: ${position}`, '', message, '', (process.env.ADMIN_PUBLIC_URL || '') + '/ko/korea/inquiries'].join('\n');
      for (const to of recipients) {
        try { await sendMail({ to, subject: `[바야다코리아 접수] ${reference}`, text, html: `<pre>${escapeHtml(text)}</pre>` }); }
        catch (error) { delivery = 'FAILED'; console.error('[korea inquiry notification]', error instanceof Error ? error.name : 'failed'); }
      }
    }
    await prisma.page.create({ data: { slug: 'korea/delivery/' + id, title: reference, content: JSON.stringify({ state: delivery, at: new Date().toISOString() }) } }).catch(() => {});
    return reply(`접수가 완료되었습니다. 접수번호: ${reference}`, 201, { reference });
  } catch (error) { console.error("[korea inquiry] persistence failed", error instanceof Error ? error.name : "error"); return reply("접수하지 못했습니다. 잠시 후 다시 시도해 주세요.", 500); }
}
