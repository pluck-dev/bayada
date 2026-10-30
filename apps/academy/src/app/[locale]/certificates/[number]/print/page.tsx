import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getCertificateByNumber } from "@/lib/queries/learning";
import { formatDate, formatMinutes } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { certificateVerifyUrl } from "@/lib/qr";

export const metadata: Metadata = { title: "수료증", robots: { index: false, follow: false } };

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ locale: string; number: string }>;
}) {
  const { locale, number: rawNumber } = await params;
  const number = decodeParam(rawNumber);
  const selfPath = `/${locale}/certificates/${number}/print`;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(selfPath)}`);
  const cert = await getCertificateByNumber(number);
  // 본인(또는 관리자)만 원본 출력. 타인은 공개 검증 페이지를 쓴다
  if (!cert || (cert.userId !== viewer.id && viewer.role !== "ADMIN")) notFound();

  const verifyUrl = certificateVerifyUrl(locale, cert.number);
  const holder = cert.user.name ?? cert.user.email.split("@")[0];
  const duration = formatMinutes(cert.course.durationMin);

  return (
    <div className="bg-surface py-10 print:bg-canvas print:py-0">
      <div className="mx-auto mb-6 flex max-w-[1000px] items-center justify-between px-5 print:hidden">
        <Link href={`/${locale}/dashboard/certificates`} className="flex items-center gap-1.5 text-body-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> 인증서 목록
        </Link>
        <PrintButton />
      </div>

      {/* A4 가로 비율 */}
      <div className="mx-auto aspect-[297/210] w-full max-w-[1000px] bg-canvas shadow-xs print:h-[210mm] print:w-[297mm] print:max-w-none print:shadow-none">
        <div className="flex h-full flex-col p-[4%]">
          <div className="flex h-full flex-col rounded-sm border-[3px] border-ink p-[5%]">
            <div className="flex items-start justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-extrabold tracking-tight text-brand">BAYADA</span>
                <span className="text-title font-semibold text-ink">Academy</span>
              </div>
              <p className="text-right text-caption text-muted">
                수료번호
                <br />
                <span className="font-mono text-body-sm font-semibold text-ink">{cert.number}</span>
              </p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-body-sm font-semibold tracking-[0.5em] text-muted">CERTIFICATE OF COMPLETION</p>
              <h1 className="mt-3 text-[44px] font-bold tracking-[0.3em] text-ink">수 료 증</h1>
              <p className="mt-8 text-[32px] font-bold text-ink">{holder}</p>
              <div className="mt-6 h-px w-24 bg-brand" />
              <p className="mt-6 max-w-[70%] text-title leading-relaxed text-ink-soft">
                위 사람은 바야다 아카데미에서 운영하는
                <br />
                <strong className="text-ink">「{cert.course.title}」</strong>
                {duration ? ` (${duration})` : ""} 과정을
                <br />
                성실히 이수하였기에 이 증서를 수여합니다.
              </p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div className="flex items-end gap-4">
                <CertificateQr url={verifyUrl} className="h-[84px] w-[84px] shrink-0" />
                <div className="text-body-sm text-muted">
                  <p>발급일 {formatDate(cert.issuedAt)}</p>
                  <p className="mt-1">유효기간 {cert.expiresAt ? `${formatDate(cert.expiresAt)}까지` : "없음"}</p>
                  <p className="mt-1 break-all">검증 {verifyUrl}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-h3 font-bold text-ink">바야다홈헬스케어</p>
                <p className="mt-1 text-body-sm text-muted">{cert.course.provider?.name ?? "BAYADA Home Health Care"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
