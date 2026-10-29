import Link from "next/link";
import type { Metadata } from "next";
import { Award, BadgeCheck, Download } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getMyCertificates } from "@/lib/queries/learning";
import { getMyApplications, getMyCredentials, takeRenewalNotices } from "@/lib/queries/credentials";
import { APP_STATUS_CLASS, APP_STATUS_LABEL, credentialState, daysLeft, type CredentialState } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { RenewalBanner } from "@/components/credentials/RenewalBanner";
import { certificateVerifyUrl } from "@/lib/qr";

export const metadata: Metadata = { title: "인증서" };

function StatePill({ state, expiresAt }: { state: CredentialState; expiresAt: Date | null }) {
  const map: Record<CredentialState, { text: string; cls: string }> = {
    valid: { text: "유효", cls: "bg-success-soft text-success" },
    expiring: { text: expiresAt ? `만료 ${daysLeft(expiresAt)}일 전` : "만료 임박", cls: "bg-amber-50 text-amber-700" },
    expired: { text: "만료됨", cls: "bg-line-soft text-muted" },
    revoked: { text: "취소됨", cls: "bg-brand-soft text-brand" },
  };
  const m = map[state];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>{m.text}</span>;
}

export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = (await getViewer())!;
  const [certificates, credentials, applications, renewals] = await Promise.all([
    getMyCertificates(viewer.id),
    getMyCredentials(viewer.id),
    getMyApplications(viewer.id),
    takeRenewalNotices(viewer.id),
  ]);
  const btnDark = "inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft";
  // 결론이 난 신청 중 발급된 것은 지갑 카드로 보이니, 신청 현황에는 진행 중·반려만 남긴다
  const shownApps = applications.filter((a) => a.status !== "APPROVED");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">인증서</h1>
      <p className="mt-2 text-sm text-muted">
        바야다 인증 {credentials.length}개 · 수료증 {certificates.length}개. PDF로 저장하거나 검증 링크를 공유할 수 있어요.
      </p>

      <div className="mt-8">
        <RenewalBanner locale={locale} items={renewals} />
      </div>

      {credentials.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-ink-soft">바야다 인증</h2>
          <ul className="grid gap-4 xl:grid-cols-2">
            {credentials.map((c) => {
              const state = credentialState(c, c.program.renewalNoticeDays);
              const usable = state === "valid" || state === "expiring";
              return (
                <li key={c.number} className={`flex gap-5 rounded-2xl border bg-white p-5 ${usable ? "border-line" : "border-line-soft"}`}>
                  <div
                    className={`flex aspect-[1.414] w-28 shrink-0 flex-col justify-between rounded-lg border-2 border-brand bg-white p-2.5 sm:w-36 ${
                      usable ? "" : "opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold text-brand">BAYADA 인증</span>
                    <CertificateQr url={certificateVerifyUrl(locale, c.number)} className="h-12 w-12 self-center rounded-sm bg-white p-0.5 sm:h-16 sm:w-16" />
                    <span className="h-px bg-brand/30" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                        <BadgeCheck className="h-3 w-3" aria-hidden /> 바야다 인증
                      </span>
                      <StatePill state={state} expiresAt={c.expiresAt} />
                    </div>
                    <Link
                      href={`/${locale}/certifications/${encodeURIComponent(c.program.slug)}`}
                      className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug text-ink hover:text-brand"
                    >
                      {c.program.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {c.number} · {formatDate(c.issuedAt)} 발급 · {c.expiresAt ? `${formatDate(c.expiresAt)} 만료` : "영구"}
                      {c.expiresAt && usable && ` · ${c.program.renewalNoticeDays}일 전 알림`}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {usable && (
                        <Link href={`/${locale}/credentials/${c.number}/print`} className={btnDark}>
                          <Download className="h-4 w-4" aria-hidden /> PDF 다운로드
                        </Link>
                      )}
                      <CopyLinkButton path={`/${locale}/verify/${c.number}`} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {shownApps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-ink-soft">인증 신청 현황</h2>
          <ul className="divide-y divide-line-soft rounded-2xl border border-line bg-white">
            {shownApps.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/certifications/${encodeURIComponent(a.program.slug)}`}
                    className="text-[15px] font-semibold text-ink hover:text-brand"
                  >
                    {a.program.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(a.createdAt)} 신청{a.decidedAt ? ` · ${formatDate(a.decidedAt)} 처리` : ""}
                  </p>
                  {a.status === "REJECTED" && a.decisionNote && (
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      반려 사유: {a.decisionNote}
                    </p>
                  )}
                </div>
                <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto ${APP_STATUS_CLASS[a.status]}`}>
                  {APP_STATUS_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        {(credentials.length > 0 || shownApps.length > 0) && <h2 className="mb-3 text-sm font-semibold text-ink-soft">수료증</h2>}
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
                  <span className="self-start rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-semibold text-ink-soft">수료증</span>
                  <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{c.course.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {c.number} · {formatDate(c.issuedAt)} 발급
                    {c.expiresAt ? ` · ${formatDate(c.expiresAt)}까지` : " · 유효기간 없음"}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link href={`/${locale}/certificates/${c.number}/print`} className={btnDark}>
                      <Download className="h-4 w-4" aria-hidden /> PDF 다운로드
                    </Link>
                    <CopyLinkButton path={`/${locale}/verify/${c.number}`} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {credentials.length === 0 && shownApps.length === 0 && (
        <Link
          href={`/${locale}/certifications`}
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-ink"
        >
          <span className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="block text-sm font-semibold text-ink">수료 다음 단계, 바야다 인증</span>
              <span className="block text-xs text-muted">선수 프로그램을 수료하고 평가를 통과하면 바야다 인증을 받을 수 있어요.</span>
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-ink">알아보기 →</span>
        </Link>
      )}
    </div>
  );
}
