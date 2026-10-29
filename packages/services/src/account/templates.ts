// 메일 템플릿 — 아카데미 디자인 톤(zinc 중립 + BAYADA 레드 #e31b34, Pretendard 계열)을 인라인 스타일로.
// 메일 클라이언트는 외부 CSS·웹폰트를 거의 지원하지 않아 table 레이아웃 + 인라인 스타일만 쓴다.
import type { MailMessage } from "./mailer";

const BRAND = "#e31b34";
const INK = "#18181b";
const MUTED = "#71717a";
const LINE = "#e4e4e7";
const FONT = `Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif`;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

interface LayoutInput {
  title: string;
  /** 이미 escape 된 문단 HTML 목록 */
  paragraphs: string[];
  cta?: { label: string; url: string };
  footnote?: string;
}

function layout({ title, paragraphs, cta, footnote }: LayoutInput): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${INK};">${p}</p>`)
    .join("");
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="border-radius:12px;background:${BRAND};">
<a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(cta.label)}</a>
</td></tr></table>
<p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">버튼이 열리지 않으면 아래 주소를 브라우저에 붙여 넣어 주세요.<br><a href="${escapeHtml(cta.url)}" style="color:${MUTED};word-break:break-all;">${escapeHtml(cta.url)}</a></p>`
    : "";
  const note = footnote
    ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(footnote)}</p>`
    : "";
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${LINE};border-radius:16px;">
<tr><td style="padding:28px 32px 0;"><span style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:${BRAND};">BAYADA</span> <span style="font-size:16px;font-weight:600;color:${INK};">Academy</span></td></tr>
<tr><td style="padding:20px 32px 32px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.4;font-weight:700;letter-spacing:-0.02em;color:${INK};">${escapeHtml(title)}</h1>
${body}${button}${note}
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">본 메일은 발신 전용입니다. &copy; BAYADA Home Health Care</p>
</td></tr></table></body></html>`;
}

function text(title: string, lines: string[], url?: string, footnote?: string): string {
  return [title, "", ...lines, ...(url ? ["", url] : []), ...(footnote ? ["", footnote] : [])].join("\n");
}

export function passwordResetMail(input: { to: string; name: string | null; url: string; minutes: number; admin?: boolean }): MailMessage {
  const title = input.admin ? "[어드민] 비밀번호 재설정 안내" : "비밀번호 재설정 안내";
  const hello = `${input.name ? `${input.name}님, ` : ""}비밀번호 재설정을 요청하셨어요.`;
  const lines = [hello, `아래 버튼을 눌러 ${input.minutes}분 안에 새 비밀번호를 설정해 주세요. 링크는 한 번만 쓸 수 있어요.`];
  const foot = "직접 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 바뀌지 않습니다.";
  return {
    to: input.to,
    subject: `[BAYADA Academy] ${title}`,
    html: layout({ title, paragraphs: lines.map(escapeHtml), cta: { label: "새 비밀번호 설정", url: input.url }, footnote: foot }),
    text: text(title, lines, input.url, foot),
    link: input.url,
  };
}

export function emailVerifyMail(input: { to: string; name: string | null; url: string; hours: number }): MailMessage {
  const title = "이메일 주소를 인증해 주세요";
  const lines = [
    `${input.name ? `${input.name}님, ` : ""}바야다 아카데미에 가입해 주셔서 감사합니다.`,
    `아래 버튼을 누르면 이메일 인증이 완료돼요. 링크는 ${input.hours}시간 동안 유효합니다.`,
  ];
  const foot = "가입한 적이 없다면 이 메일을 무시하세요.";
  return {
    to: input.to,
    subject: `[BAYADA Academy] ${title}`,
    html: layout({ title, paragraphs: lines.map(escapeHtml), cta: { label: "이메일 인증하기", url: input.url }, footnote: foot }),
    text: text(title, lines, input.url, foot),
    link: input.url,
  };
}

export function orgInviteMail(input: { to: string; organizationName: string; inviterName: string | null; url: string }): MailMessage {
  const title = `${input.organizationName} 초대`;
  const lines = [
    `${input.inviterName ? `${input.inviterName}님이 ` : ""}${input.organizationName}의 바야다 아카데미 기관 학습에 초대했어요.`,
    `초대받은 이메일(${input.to})로 로그인하거나 가입한 뒤 초대를 수락하면 기관에서 배정한 교육을 바로 시작할 수 있어요.`,
  ];
  const foot = "초대를 예상하지 못했다면 이 메일을 무시하세요.";
  return {
    to: input.to,
    subject: `[BAYADA Academy] ${title}`,
    html: layout({ title, paragraphs: lines.map(escapeHtml), cta: { label: "초대 확인하기", url: input.url }, footnote: foot }),
    text: text(title, lines, input.url, foot),
    link: input.url,
  };
}

export function credentialRenewalMail(input: {
  to: string;
  name: string | null;
  programTitle: string;
  number: string;
  expiresOn: string;
  daysLeft: number;
  url: string;
}): MailMessage {
  const title = "바야다 인증 갱신 안내";
  const lines = [
    `${input.name ? `${input.name}님, ` : ""}보유하신 인증의 만료일이 다가오고 있어요.`,
    `${input.programTitle} (${input.number}) — ${input.expiresOn} 만료 (D-${input.daysLeft})`,
    "만료 전에 갱신 신청을 하면 인증을 이어서 유지할 수 있어요.",
  ];
  return {
    to: input.to,
    subject: `[BAYADA Academy] ${title}: ${input.programTitle}`,
    html: layout({ title, paragraphs: lines.map(escapeHtml), cta: { label: "갱신 신청하기", url: input.url } }),
    text: text(title, lines, input.url),
    link: input.url,
  };
}
