import { Badge, EmptyState, Notice, PageHeader, SectionHeader, buttonVariants, cn } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { Award, BadgeCheck, Download } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getMyCertificates } from "@/lib/queries/learning";
import { getMyApplications, getMyCredentials, takeRenewalNotices } from "@/lib/queries/credentials";
import { APP_STATUS_TONE, APP_STATUS_LABEL, credentialState, daysLeft, type CredentialState } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { RenewalBanner } from "@/components/credentials/RenewalBanner";
import { certificateVerifyUrl } from "@/lib/qr";

export const metadata: Metadata = { title: "인증서" };

function StatePill({ state, expiresAt }: { state: CredentialState; expiresAt: Date | null }) {
  const map: Record<CredentialState, { text: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
    valid: { text: "유효", tone: "success" },
    expiring: { text: expiresAt ? `만료 ${daysLeft(expiresAt)}일 전` : "만료 임박", tone: "warning" },
    expired: { text: "만료됨", tone: "neutral" },
    revoked: { text: "취소됨", tone: "danger" },
  };
  const m = map[state];
  return (
    <Badge tone={m.tone} dot>
      {m.text}
    </Badge>
  );
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
  const btn = buttonVariants({ variant: "secondary", size: "sm" });
  // 결론이 난 신청 중 발급된 것은 지갑 카드로 보이니, 신청 현황에는 진행 중·반려만 남긴다
  const shownApps = applications.filter((a) => a.status !== "APPROVED");

  return (
    <div>
      <PageHeader
        title="인증서"
        description={`바야다 인증 ${credentials.length}개 · 수료증 ${certificates.length}개. PDF로 저장하거나 검증 링크를 공유할 수 있어요.`}
        className="mb-6 md:mb-8"
      />

      <div className="empty:hidden [&:not(:empty)]:mb-8">
        <RenewalBanner locale={locale} items={renewals} />
      </div>

      {credentials.length > 0 && (
        <section className="mb-12">
          <SectionHeader size="sm" title="바야다 인증" />
          <ul className="grid gap-4 xl:grid-cols-2">
            {credentials.map((c) => {
              const state = credentialState(c, c.program.renewalNoticeDays);
              const usable = state === "valid" || state === "expiring";
              return (
                <li key={c.number} className={cn("flex gap-5 rounded-xl border border-line bg-canvas p-5", !usable && "bg-surface")}>
                  <div
                    className={cn(
                      "flex aspect-[1.414] w-28 shrink-0 flex-col justify-between rounded-md border border-brand-200 bg-canvas p-2.5 sm:w-36",
                      !usable && "opacity-50 grayscale",
                    )}
                  >
                    <span className="text-[9px] font-extrabold text-brand">BAYADA 인증</span>
                    <CertificateQr url={certificateVerifyUrl(locale, c.number)} className="h-12 w-12 self-center rounded-sm bg-canvas p-0.5 sm:h-16 sm:w-16" />
                    <span className="h-px bg-brand/30" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="brand" icon={<BadgeCheck aria-hidden />}>
                        바야다 인증
                      </Badge>
                      <StatePill state={state} expiresAt={c.expiresAt} />
                    </div>
                    <Link
                      href={`/${locale}/certifications/${encodeURIComponent(c.program.slug)}`}
                      className="mt-2 line-clamp-2 text-title text-ink underline-offset-4 hover:underline"
                    >
                      {c.program.title}
                    </Link>
                    <p className="mt-1 text-caption text-muted">
                      {c.number} · {formatDate(c.issuedAt)} 발급 · {c.expiresAt ? `${formatDate(c.expiresAt)} 만료` : "영구"}
                      {c.expiresAt && usable && ` · ${c.program.renewalNoticeDays}일 전 알림`}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {usable && (
                        <Link href={`/${locale}/credentials/${c.number}/print`} className={btn}>
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
        <section className="mb-12">
          <SectionHeader size="sm" title="인증 신청 현황" />
          <ul className="divide-y divide-line rounded-xl border border-line bg-canvas">
            {shownApps.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/certifications/${encodeURIComponent(a.program.slug)}`}
                    className="text-body font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {a.program.title}
                  </Link>
                  <p className="mt-0.5 text-caption text-muted">
                    {formatDate(a.createdAt)} 신청{a.decidedAt ? ` · ${formatDate(a.decidedAt)} 처리` : ""}
                  </p>
                  {a.status === "REJECTED" && a.decisionNote && (
                    <Notice tone="danger" className="mt-2 px-3 py-2.5" title="반려 사유">
                      <span className="whitespace-pre-line">{a.decisionNote}</span>
                    </Notice>
                  )}
                </div>
                <Badge size="md" tone={APP_STATUS_TONE[a.status]} dot className="self-start sm:self-auto">
                  {APP_STATUS_LABEL[a.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        {(credentials.length > 0 || shownApps.length > 0) && <SectionHeader size="sm" title="수료증" />}
        {certificates.length === 0 ? (
          <EmptyState
            icon={<Award />}
            title="아직 발급된 수료증이 없어요"
            description="프로그램의 모든 강의를 마치면 수료증이 자동으로 발급돼요."
            action={
<Link href={`/${locale}/dashboard`} className={buttonVariants({ variant: "secondary" })}>
마이 러닝으로
</Link>
}
          />
        ) : (
          <ul className="grid gap-4 xl:grid-cols-2">
            {certificates.map((c) => (
              <li key={c.number} className="flex gap-5 rounded-xl border border-line bg-canvas p-5">
                <div className="flex aspect-[1.414] w-28 shrink-0 flex-col justify-between rounded-md border border-line bg-surface p-2.5 sm:w-36">
                  <span className="text-[9px] font-extrabold text-brand">BAYADA</span>
                  {/* 수료증 미리보기 안의 검증 QR (스캔하면 공개 검증 페이지) */}
                  <CertificateQr
                    url={certificateVerifyUrl(locale, c.number)}
                    className="h-12 w-12 self-center rounded-sm bg-canvas p-0.5 sm:h-16 sm:w-16"
                  />
                  <span className="h-px bg-line" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Badge>수료증</Badge>
                  <p className="mt-2 line-clamp-2 text-title text-ink">{c.course.title}</p>
                  <p className="mt-1 text-caption text-muted">
                    {c.number} · {formatDate(c.issuedAt)} 발급
                    {c.expiresAt ? ` · ${formatDate(c.expiresAt)}까지` : " · 유효기간 없음"}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link href={`/${locale}/certificates/${c.number}/print`} className={btn}>
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
          className="mt-8 flex items-center justify-between gap-4 rounded-xl bg-surface px-5 py-4 transition-colors hover:bg-surface-sunken"
        >
          <span className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden />
            <span>
              <span className="block text-body-sm font-semibold text-ink">수료 다음 단계, 바야다 인증</span>
              <span className="block text-caption text-muted">선수 프로그램을 수료하고 평가를 통과하면 바야다 인증을 받을 수 있어요.</span>
            </span>
          </span>
          <span className="shrink-0 text-body-sm font-semibold text-ink">알아보기 →</span>
        </Link>
      )}
    </div>
  );
}
