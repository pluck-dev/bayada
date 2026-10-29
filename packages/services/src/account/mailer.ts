// 메일 발송 (서버 전용). SMTP_URL·MAIL_FROM 으로 설정한다.
//   로컬: docker compose -f deploy/docker-compose.yml up -d mailpit → SMTP_URL=smtp://localhost:1025 (받은 메일은 http://localhost:8025)
//   운영: SMTP_URL=smtps://user:pass@smtp.example.com:465 등
// 개발(NODE_ENV≠production)에서 설정이 없으면 보내지 않고 서버 로그에 수신자·제목·링크를 찍는다.
// 운영에서 설정이 없으면 에러를 던진다(조용히 메일이 사라지지 않게).
import nodemailer, { type Transporter } from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** 개발 로그에 같이 찍을 핵심 링크 */
  link?: string;
}

export class MailerNotConfiguredError extends Error {
  constructor() {
    super("메일 발송 설정이 없습니다. SMTP_URL 과 MAIL_FROM 환경변수를 설정하세요.");
    this.name = "MailerNotConfiguredError";
  }
}

const globalForMailer = globalThis as unknown as { bayadaMailer?: { url: string; transport: Transporter } };

function transport(url: string): Transporter {
  const cached = globalForMailer.bayadaMailer;
  if (cached?.url === url) return cached.transport;
  const t = nodemailer.createTransport(url);
  globalForMailer.bayadaMailer = { url, transport: t };
  return t;
}

/** 소셜 로그인에서 이메일을 못 받은 계정의 자리표시 주소 (`.invalid` TLD — 실제로 보낼 수 없다) */
export const isPlaceholderEmail = (email: string) => email.toLowerCase().endsWith(".invalid");

export async function sendMail(message: MailMessage): Promise<void> {
  if (isPlaceholderEmail(message.to)) return;
  const url = process.env.SMTP_URL;
  const from = process.env.MAIL_FROM;
  if (!url || !from) {
    if (process.env.NODE_ENV === "production") throw new MailerNotConfiguredError();
    console.info(
      `[mail:dev] SMTP_URL 미설정 — 발송 생략\n  to: ${message.to}\n  subject: ${message.subject}` +
        (message.link ? `\n  link: ${message.link}` : "")
    );
    return;
  }
  await transport(url).sendMail({ from, to: message.to, subject: message.subject, html: message.html, text: message.text });
}

/**
 * 부가 기능 메일(초대·갱신 안내)은 실패해도 본 동작을 막지 않는다. 결과만 돌려준다.
 * 비밀번호 재설정처럼 메일이 곧 기능인 경우는 sendMail 을 직접 쓴다.
 */
export async function trySendMail(message: MailMessage): Promise<boolean> {
  try {
    await sendMail(message);
    return true;
  } catch (error) {
    console.error(`[mail] 발송 실패 to=${message.to} subject=${message.subject}`, error);
    return false;
  }
}
