import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getCredentialByNumber } from "@/lib/queries/credentials";
import { credentialState } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { certificateVerifyUrl } from "@/lib/qr";

export const metadata: Metadata = { title: "바야다 인증서", robots: { index: false, follow: false } };

export default async function CredentialPrintPage({ params }: { params: Promise<{ locale: string; number: string }> }) {
  const { locale, number: rawNumber } = await params;
  const number = decodeParam(rawNumber);
  const selfPath = `/${locale}/credentials/${number}/print`;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(selfPath)}`);
  const c = await getCredentialByNumber(number);
  // 본인(또는 관리자)만 원본 출력. 타인은 공개 검증 페이지를 쓴다
  if (!c || (c.userId !== viewer.id && viewer.role !== "ADMIN")) notFound();

  const state = credentialState(c, c.program.renewalNoticeDays);
  const verifyUrl = certificateVerifyUrl(locale, c.number);
  const holder = c.user.name ?? c.user.email.split("@")[0];
  const invalid = state === "revoked" || state === "expired";

  return (
    <div className="bg-surface py-10 print:bg-white print:py-0">
      <div className="mx-auto mb-6 flex max-w-[1000px] items-center justify-between px-5 print:hidden">
        <Link href={`/${locale}/dashboard/certificates`} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> 인증서 목록
        </Link>
        {invalid ? (
          <span className="rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-semibold text-brand">
            {state === "revoked" ? "취소된 인증은 출력할 수 없어요" : "유효기간이 지난 인증이에요"}
          </span>
        ) : (
          <PrintButton />
        )}
      </div>

      {/* A4 가로 비율 — 수료증 출력물과 같은 틀, 인증은 상단 띠와 붉은 테두리로 구분 */}
      <div
        className={`relative mx-auto aspect-[297/210] w-full max-w-[1000px] bg-white shadow-card print:h-[210mm] print:w-[297mm] print:max-w-none print:shadow-none ${
          invalid ? "print:hidden" : ""
        }`}
      >
        {invalid && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="-rotate-12 rounded-xl border-4 border-brand px-8 py-3 text-5xl font-extrabold tracking-[0.2em] text-brand/80">
              {state === "revoked" ? "취소됨" : "만료됨"}
            </span>
          </div>
        )}
        <div className="flex h-full flex-col p-[4%]">
          <div className="flex h-full flex-col rounded-sm border-[3px] border-brand p-[5%]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-extrabold tracking-tight text-brand">BAYADA</span>
                  <span className="text-lg font-semibold text-ink">Academy</span>
                </div>
                <span className="mt-2 inline-flex rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">바야다 인증</span>
              </div>
              <p className="text-right text-xs text-muted">
                인증번호
                <br />
                <span className="font-mono text-sm font-semibold text-ink">{c.number}</span>
              </p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold tracking-[0.5em] text-muted">BAYADA CREDENTIAL</p>
              <h1 className="mt-3 text-[44px] font-bold tracking-[0.3em] text-ink">인 증 서</h1>
              <p className="mt-8 text-[32px] font-bold text-ink">{holder}</p>
              <div className="mt-6 h-px w-24 bg-brand" />
              <p className="mt-6 max-w-[72%] text-lg leading-relaxed text-ink-soft">
                위 사람은 바야다 아카데미의 선수 과정을 수료하고
                <br />
                {c.program.practicalRequired ? "필기 시험과 실기 평가" : "필기 시험"}를 통과하여
                <br />
                <strong className="text-ink">「바야다 인증 {c.program.title}」</strong> 자격을 갖추었음을 인증합니다.
              </p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div className="flex items-end gap-4">
                <CertificateQr url={verifyUrl} className="h-[84px] w-[84px] shrink-0" />
                <div className="text-sm text-muted">
                  <p>발급일 {formatDate(c.issuedAt)}</p>
                  <p className="mt-1">유효기간 {c.expiresAt ? `${formatDate(c.expiresAt)}까지` : "영구"}</p>
                  <p className="mt-1 break-all">검증 {verifyUrl}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-ink">바야다홈헬스케어</p>
                <p className="mt-1 text-sm text-muted">BAYADA Home Health Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
