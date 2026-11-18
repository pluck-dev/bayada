"use server";

// 홈페이지 문의 접수 (옛 lib/mock.ts mockFormSubmit 대체) — 검증 → 과다 접수 제한 → WebInquiry 저장 → 알림 메일.
// 어드민 '웹사이트 > 문의 CRM' 에서 처리한다.
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@bayada/db";
import { clientIp, trySendMail } from "@bayada/services/account";
import {
  WEB_FIELD_LABEL,
  WEB_FORM_CONSENT_REQUIRED,
  WEB_FORM_REQUIRED,
  WEB_FORM_TYPES,
  formatWebFieldValue,
  isEmail,
  isPublicWebFormType,
  kstDate,
  normalizeWebSetting,
  parseEmailList,
  webFormLabel,
} from "@bayada/shared/web-content";
import type { FormSubmitResult } from "@/types";

export interface InquiryInput {
  formType: string;
  data: Record<string, unknown>;
  /** 개인정보 수집·이용 동의 체크 */
  privacyConsent?: boolean;
  /** 접수한 페이지 경로 */
  sourcePage?: string;
  /** 허니팟 — 화면에 안 보이는 입력. 값이 있으면 봇으로 본다 */
  website?: string;
}

export type InquiryResult = FormSubmitResult | { success: false; message: string };

const MAX_FIELDS = 40;
const MAX_TEXT = 3000;
/** 같은 IP 에서 10분에 5건까지 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const fail = (message: string): InquiryResult => ({ success: false, message });

/** 들어온 값을 문자열·문자열 배열·불리언만 남기고 길이를 자른다 (모양을 믿지 않는다) */
function cleanPayload(data: unknown): Record<string, string | string[] | boolean> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const out: Record<string, string | string[] | boolean> = {};
  for (const [key, v] of Object.entries(data as Record<string, unknown>).slice(0, MAX_FIELDS)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(key)) continue;
    if (typeof v === "string") {
      const s = v.trim().slice(0, MAX_TEXT);
      if (s) out[key] = s;
    } else if (typeof v === "boolean") {
      out[key] = v;
    } else if (Array.isArray(v)) {
      const list = v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 200)).filter(Boolean).slice(0, 30);
      if (list.length) out[key] = list;
    }
  }
  return out;
}

const text = (v: unknown) => (typeof v === "string" ? v : undefined);

/** 접수번호: 접두어-YYYYMMDD(KST)-일련번호. 같은 날 같은 접두어 안에서 1부터 */
async function nextReferenceNo(prefix: string): Promise<string> {
  const day = kstDate(new Date()).replace(/-/g, "");
  const head = `${prefix}-${day}-`;
  const last = await prisma.webInquiry.findFirst({
    where: { referenceNo: { startsWith: head } },
    orderBy: { createdAt: "desc" },
    select: { referenceNo: true },
  });
  const seq = last ? Number(last.referenceNo.slice(head.length)) + 1 : 1;
  return `${head}${String(seq).padStart(3, "0")}`;
}

async function notify(inquiry: { id: string; referenceNo: string; formType: string; name: string | null; phone: string | null; email: string | null }, payload: Record<string, unknown>) {
  const row = await prisma.siteSetting.findUnique({ where: { key: "web.inquiry" } });
  const to = parseEmailList(normalizeWebSetting("web.inquiry", row?.value ?? {}).notifyEmails);
  if (to.length === 0) return;
  const adminUrl = (process.env.ADMIN_PUBLIC_URL || "").replace(/\/+$/, "");
  const link = adminUrl ? `${adminUrl}/ko/web/inquiries/${inquiry.id}` : undefined;
  const lines = Object.entries(payload).map(([k, v]) => `${WEB_FIELD_LABEL[k] ?? k}: ${formatWebFieldValue(k, v)}`);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const subject = `[홈페이지 문의] ${webFormLabel(inquiry.formType)} ${inquiry.referenceNo}`;
  const body = [`접수번호: ${inquiry.referenceNo}`, `유형: ${webFormLabel(inquiry.formType)}`, "", ...lines];
  for (const addr of to) {
    await trySendMail({
      to: addr,
      subject,
      text: [...body, ...(link ? ["", link] : [])].join("\n"),
      html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.7">${body.map((l) => (l ? esc(l) : "&nbsp;")).join("<br>")}${
        link ? `<p><a href="${esc(link)}">어드민에서 보기</a></p>` : ""
      }</div>`,
      link,
    });
  }
}

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  const formType = isPublicWebFormType(input?.formType) ? input.formType : null;
  if (!formType) return fail("알 수 없는 신청서입니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
  const { prefix } = WEB_FORM_TYPES[formType];

  // 봇: 저장하지 않고 성공처럼 보이게 한다 (재시도 유도 방지)
  if (input.website) {
    return { success: true, referenceNumber: `${prefix}-${kstDate(new Date()).replace(/-/g, "")}-000`, message: "접수가 완료되었습니다." };
  }

  const payload = cleanPayload(input.data);
  if (!payload) return fail("입력값을 확인해 주세요.");
  const missing = WEB_FORM_REQUIRED[formType].filter((k) => payload[k] === undefined || payload[k] === "");
  if (missing.length) return fail(`필수 항목을 입력해 주세요: ${missing.map((k) => WEB_FIELD_LABEL[k] ?? k).join(", ")}`);
  const consent = input.privacyConsent === true;
  if (WEB_FORM_CONSENT_REQUIRED.includes(formType) && !consent) return fail("개인정보 수집·이용에 동의해 주세요.");
  const email = text(payload.email);
  if (email && !isEmail(email)) return fail("이메일 주소 형식을 확인해 주세요.");
  const phone = text(payload.phone);
  if (phone && !/^[0-9+\-() ]{7,20}$/.test(phone)) return fail("전화번호 형식을 확인해 주세요.");

  const h = await headers();
  const ip = clientIp(h);
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const recent = await prisma.webInquiry.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) } },
  });
  if (ip !== "unknown" && recent >= RATE_MAX) return fail("짧은 시간에 너무 많이 접수되었습니다. 잠시 후 다시 시도해 주세요.");

  const sourcePage = typeof input.sourcePage === "string" && input.sourcePage.startsWith("/") ? input.sourcePage.slice(0, 200) : null;
  const base = {
    formType,
    name: text(payload.name) ?? text(payload.representative) ?? null,
    phone: phone ?? null,
    email: email?.toLowerCase() ?? null,
    organization: text(payload.organization) ?? null,
    payload,
    privacyConsent: consent,
    sourcePage,
    ipHash,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    userId: null,
  };

  // 같은 순간 두 건이 같은 번호를 잡으면 unique 충돌 → 다시 번호를 받는다
  for (let attempt = 0; attempt < 5; attempt++) {
    const referenceNo = await nextReferenceNo(prefix);
    try {
      const inquiry = await prisma.webInquiry.create({ data: { ...base, referenceNo } });
      try {
        await notify(inquiry, payload);
      } catch (error) {
        console.error("[inquiry] 알림 메일 준비 실패", error);
      }
      return { success: true, referenceNumber: referenceNo, message: `접수가 완료되었습니다. 접수번호: ${referenceNo}` };
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") {
        console.error("[inquiry] 저장 실패", error);
        return fail("접수 중 오류가 발생했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.");
      }
    }
  }
  return fail("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
}
