import Link from "next/link";
import type { Metadata } from "next";
import { Award, Download } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getMyCertificates } from "@/lib/queries/learning";
import { formatDate } from "@/lib/labels";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { certificateVerifyUrl } from "@/lib/qr";

export const metadata: Metadata = { title: "인증서" };

export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = (await getViewer())!;
  const certificates = await getMyCertificates(viewer.id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">인증서</h1>
      <p className="mt-2 text-sm text-muted">
        수료한 프로그램의 수료증 {certificates.length}개. PDF로 저장하거나 검증 링크를 공유할 수 있어요.
      </p>

      <div className="mt-8">
        {certificates.length === 0 ? (
          <EmptyState
            icon={<Award className="h-5 w-5" />}
            title="아직 발급된 수료증이 없어요"
            description="프로그램의 모든 강의를 마치면 수료증이 자동으로 발급돼요."
            action={{ label: "마이 러닝으로", href: `/${locale}/dashboard` }}
          />
        ) : (
          <ul className="grid gap-4 xl:grid-cols-2">
            {certificates.map((c) => (
              <li key={c.number} className="flex gap-5 rounded-2xl border border-line bg-white p-5">
                <div className="flex aspect-[1.414] w-28 shrink-0 flex-col justify-between rounded-lg border border-line bg-surface p-2.5 sm:w-36">
                  <span className="text-[9px] font-extrabold text-brand">BAYADA</span>
                  {/* 수료증 미리보기 안의 검증 QR (스캔하면 공개 검증 페이지) */}
                  <CertificateQr
                    url={certificateVerifyUrl(locale, c.number)}
                    className="h-12 w-12 self-center rounded-sm bg-white p-0.5 sm:h-16 sm:w-16"
                  />
                  <span className="h-px bg-line" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{c.course.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {c.number} · {formatDate(c.issuedAt)} 발급
                    {c.expiresAt ? ` · ${formatDate(c.expiresAt)}까지` : " · 유효기간 없음"}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link
                      href={`/${locale}/certificates/${c.number}/print`}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
                    >
                      <Download className="h-4 w-4" aria-hidden /> PDF 다운로드
                    </Link>
                    <CopyLinkButton path={`/${locale}/verify/${c.number}`} />
                  </div>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
