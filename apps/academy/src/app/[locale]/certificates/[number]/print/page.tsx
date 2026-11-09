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
      <div className="mx-auto mb-6 flex max-w-[1000px] items-center justify-between gap-3 px-5 print:hidden">
        <Link href={`/${locale}/dashboard/certificates`} className="flex items-center gap-1.5 text-body-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> 인증서 목록
        </Link>
        <PrintButton />
      </div>

      {/* A4 가로 비율. 글자·여백을 증서 폭 기준(cqw)으로 잡아 휴대폰에서도 비율 그대로 줄어든다 */}
      <div className="mx-auto w-full max-w-[1000px] px-3 sm:px-5 print:max-w-none print:px-0">
        <div className="[container-type:inline-size] print:w-[297mm]">
          <div className="aspect-[297/210] w-full bg-canvas shadow-md print:h-[210mm] print:shadow-none" style={{ padding: "3.2cqw" }}>
            <div className="relative flex h-full flex-col border-ink" style={{ borderWidth: "0.3cqw", padding: "4.2cqw 5cqw" }}>
              <span aria-hidden className="pointer-events-none absolute inset-0 border-brand" style={{ margin: "0.8cqw", borderWidth: "0.12cqw" }} />
              <div className="relative flex items-start justify-between">
                <div className="flex items-baseline" style={{ gap: "0.8cqw" }}>
                  <span className="font-black tracking-tight text-brand" style={{ fontSize: "2.9cqw" }}>
                    BAYADA
                  </span>
                  <span className="font-bold text-ink" style={{ fontSize: "1.7cqw" }}>
                    Academy
                  </span>
                </div>
                <p className="text-right text-muted" style={{ fontSize: "1.15cqw", lineHeight: 1.5 }}>
                  수료번호
                  <br />
                  <span className="font-mono font-semibold text-ink" style={{ fontSize: "1.4cqw" }}>
                    {cert.number}
                  </span>
                </p>
              </div>

              <div className="relative flex flex-1 flex-col items-center justify-center text-center">
                <p className="font-semibold text-muted" style={{ fontSize: "1.3cqw", letterSpacing: "0.5em" }}>
                  CERTIFICATE OF COMPLETION
                </p>
                <h1 className="font-extrabold text-ink" style={{ fontSize: "4.6cqw", letterSpacing: "0.3em", marginTop: "0.8cqw" }}>
                  수 료 증
                </h1>
                <p className="font-bold text-ink" style={{ fontSize: "3.2cqw", marginTop: "2.6cqw" }}>
                  {holder}
                </p>
                <div className="bg-brand" style={{ height: "0.15cqw", width: "8cqw", marginTop: "2cqw" }} />
                <p className="text-ink-soft" style={{ fontSize: "1.75cqw", lineHeight: 1.75, marginTop: "2cqw", maxWidth: "72%" }}>
                  위 사람은 바야다 아카데미에서 운영하는
                  <br />
                  <strong className="text-ink">「{cert.course.title}」</strong>
                  {duration ? ` (${duration})` : ""} 과정을
                  <br />
                  성실히 이수하였기에 이 증서를 수여합니다.
                </p>
              </div>

              <div className="relative flex items-end justify-between" style={{ gap: "2cqw" }}>
                <div className="flex min-w-0 items-end" style={{ gap: "1.6cqw" }}>
                  <CertificateQr url={verifyUrl} className="shrink-0" style={{ width: "8.4cqw", height: "8.4cqw" }} />
                  <div className="min-w-0 text-muted" style={{ fontSize: "1.25cqw", lineHeight: 1.6 }}>
                    <p>발급일 {formatDate(cert.issuedAt)}</p>
                    <p>유효기간 {cert.expiresAt ? `${formatDate(cert.expiresAt)}까지` : "없음"}</p>
                    <p className="break-all">검증 {verifyUrl}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-extrabold text-ink" style={{ fontSize: "2.1cqw" }}>
                    바야다홈헬스케어
                  </p>
                  <p className="text-muted" style={{ fontSize: "1.25cqw", marginTop: "0.3cqw" }}>
                    {cert.course.provider?.name ?? "BAYADA Home Health Care"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
