import { Badge, Breadcrumb, Notice, ProgressBar, cn } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, CircleDashed, ClipboardCheck, Lock, RefreshCw } from "lucide-react";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { getProgramDetail } from "@/lib/queries/credentials";
import { APP_STATUS_TONE, APP_STATUS_LABEL, credentialState, daysLeft, validityText } from "@/lib/credentials";
import { formatDate, formatMinutes } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { ApplyForm } from "@/components/credentials/ApplyForm";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.credentialProgram.findUnique({ where: { slug: decodeParam(slug) }, select: { title: true, summary: true, active: true } });
  if (!p) return { title: "바야다 인증" };
  return { title: `바야다 인증 · ${p.title}`, description: p.summary ?? undefined, robots: p.active ? undefined : { index: false } };
}

export default async function CertificationDetailPage({ params }: { params: Params }) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  const viewer = await getViewer();
  const data = await getProgramDetail(slug, viewer);
  if (!data) notFound();
  const { program: p, prerequisites, applications, credentials, eligibility } = data;
  const done = prerequisites.filter((r) => r.completedAt).length;
  const latest = applications[0];
  const now = new Date();
  const current = credentials.find((c) => !c.revokedAt && (!c.expiresAt || c.expiresAt > now));
  const currentState = current ? credentialState(current, p.renewalNoticeDays, now) : null;

  const reason = eligibility.ok
    ? undefined
    : eligibility.reason === "inactive"
      ? "지금은 신청을 받지 않는 인증 과정이에요."
      : eligibility.reason === "prerequisites"
        ? `선수 프로그램 ${prerequisites.length - done}개를 더 수료하면 신청할 수 있어요.`
        : eligibility.reason === "open"
          ? "심사 중인 신청이 있어요. 결과는 마이 러닝 › 인증서에서 확인할 수 있어요."
          : "유효한 인증을 보유하고 있어요. 만료가 가까워지면 갱신 신청할 수 있어요.";

  return (
    <div className="container-page page-y">
      <Breadcrumb LinkComponent={Link} items={[{ label: "홈", href: `/${locale}` }, { label: "바야다 인증", href: `/${locale}/certifications` }, { label: p.title }]} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="min-w-0">
          <Badge size="md" tone="brand" icon={<BadgeCheck aria-hidden />}>
            바야다 인증
          </Badge>
          <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-ink md:text-h1">{p.title}</h1>
          {p.summary && <p className="mt-4 text-body-lg leading-relaxed text-muted">{p.summary}</p>}

          <dl className="mt-8 grid grid-cols-3 gap-6 border-y border-line py-6">
            {[
              ["선수 프로그램", `${prerequisites.length}개`],
              ["평가", p.practicalRequired ? "시험 + 실기" : "시험"],
              ["유효기간", p.validityMonths == null ? "영구" : validityText(p.validityMonths).replace("발급일로부터 ", "")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-caption text-muted">{k}</dt>
                <dd className="mt-1 text-title text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {p.description && (
            <section className="mt-14">
              <h2 className="text-h2 text-ink">인증 소개</h2>
              <p className="mt-4 whitespace-pre-line text-body leading-relaxed text-ink-soft">{p.description}</p>
            </section>
          )}

          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-h2 text-ink">신청 자격 · 선수 프로그램</h2>
              {viewer && (
                <span className={`text-body-sm font-semibold ${done === prerequisites.length ? "text-success" : "text-ink-soft"}`}>
                  {done}/{prerequisites.length} 수료
                </span>
              )}
            </div>
            <p className="mt-2 text-body-sm text-muted">아래 프로그램을 모두 수료하면 인증을 신청할 수 있어요.</p>
            <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
              {prerequisites.map((r, i) => (
                <li key={r.courseId} className="flex items-center gap-4 px-5 py-4">
                  {viewer && r.completedAt ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="수료" />
                  ) : r.title ? (
                    <CircleDashed className="h-5 w-5 shrink-0 text-subtle" aria-label="미수료" />
                  ) : (
                    <Lock className="h-5 w-5 shrink-0 text-subtle" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    {r.title ? (
                      <Link href={`/${locale}/courses/${encodeURIComponent(r.slug!)}`} className="text-body font-semibold text-ink underline-offset-4 hover:underline">
                        {i + 1}. {r.title}
                      </Link>
                    ) : (
                      <p className="text-body font-semibold text-ink-soft">{i + 1}. 임직원 전용 프로그램</p>
                    )}
                    {viewer && r.enrolled && !r.completedAt && (
                      <ProgressBar className="mt-2 max-w-[280px]" size="sm" value={r.progressPercent} showValue />
                    )}
                  </div>
                  <span className="shrink-0 text-caption text-muted">
                    {viewer && r.completedAt
                      ? `${formatDate(r.completedAt)} 수료`
                      : viewer && r.enrolled
                        ? "학습 중"
                        : r.title
                          ? (formatMinutes(r.durationMin) ?? "")
                          : "로그인한 임직원만 볼 수 있어요"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="text-h2 text-ink">평가 기준</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface p-5">
                <p className="text-caption text-muted">필기 시험</p>
                <p className="mt-1 text-title font-bold text-ink">{p.examPassingScore}점 이상 합격</p>
                <p className="mt-1 text-caption text-muted">100점 만점</p>
              </div>
              <div className="rounded-xl bg-surface p-5">
                <p className="text-caption text-muted">실기 평가</p>
                <p className="mt-1 text-title font-bold text-ink">{p.practicalRequired ? `${p.practicalPassingScore}점 이상 합격` : "없음"}</p>
                <p className="mt-1 text-caption text-muted">{p.practicalRequired ? "심사위원 현장 평가 · 100점 만점" : "필기 시험만으로 판정해요"}</p>
              </div>
            </div>
            {p.criteria && (
              <div className="mt-4 rounded-xl border border-line p-5">
                <p className="flex items-center gap-1.5 text-body-sm font-semibold text-ink">
                  <ClipboardCheck className="h-4 w-4 text-ink-soft" aria-hidden /> 세부 평가 기준
                </p>
                <p className="mt-2 whitespace-pre-line text-body-sm leading-relaxed text-ink-soft">{p.criteria}</p>
              </div>
            )}
          </section>

          <section className="mt-14">
            <h2 className="text-h2 text-ink">유효기간 · 갱신</h2>
            <ul className="mt-5 space-y-2.5 text-body leading-relaxed text-ink-soft">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                유효기간: {validityText(p.validityMonths)}
              </li>
              {p.validityMonths != null && (
                <li className="flex gap-2">
                  <RefreshCw className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                  만료 {p.renewalNoticeDays}일 전부터 마이 러닝에서 갱신 안내를 드리고, 같은 페이지에서 갱신 신청할 수 있어요.
                </li>
              )}
              <li className="flex gap-2">
                <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                인증번호와 QR로 누구나 공개 검증 페이지에서 유효 여부를 확인할 수 있어요.
              </li>
            </ul>
          </section>
        </div>

        <aside>
          <div className="space-y-4 lg:sticky lg:top-24">
            {current && (
              <div className={cn("rounded-xl p-5", currentState === "expiring" ? "bg-warning-soft" : "bg-success-soft")}>
                <p className={cn("flex items-center gap-1.5 text-body-sm font-semibold", currentState === "expiring" ? "text-warning" : "text-success")}>
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  {currentState === "expiring" && current.expiresAt ? `만료 ${daysLeft(current.expiresAt, now)}일 전` : "인증 보유 중"}
                </p>
                <p className="mt-2 font-mono text-body-sm font-semibold text-ink">{current.number}</p>
                <p className="mt-1 text-caption text-muted">
                  {formatDate(current.issuedAt)} 발급 · {current.expiresAt ? `${formatDate(current.expiresAt)}까지` : "영구"}
                </p>
                <Link href={`/${locale}/credentials/${current.number}/print`} className="mt-3 inline-flex text-body-sm font-semibold text-ink underline-offset-4 hover:underline">
                  인증서 보기 →
                </Link>
              </div>
            )}

            <div className="rounded-xl border border-line bg-canvas p-6">
              <p className="text-h3 text-ink">{eligibility.ok && eligibility.renewal ? "갱신 신청" : "인증 신청"}</p>
              {latest && (
                <div className="mt-4 rounded-xl bg-surface px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-caption text-muted">{formatDate(latest.createdAt)} 신청</span>
                    <Badge tone={APP_STATUS_TONE[latest.status]} dot>
                      {APP_STATUS_LABEL[latest.status]}
                    </Badge>
                  </div>
                  {latest.status === "REJECTED" && latest.decisionNote && (
                    <p className="mt-2 whitespace-pre-line text-caption leading-relaxed text-ink-soft">반려 사유: {latest.decisionNote}</p>
                  )}
                </div>
              )}
              <div className="mt-5">
                <ApplyForm
                  slug={p.slug}
                  locale={locale}
                  loggedIn={!!viewer}
                  canApply={eligibility.ok}
                  reason={reason}
                  renewal={eligibility.ok && eligibility.renewal}
                />
              </div>
              <p className="mt-4 text-caption leading-relaxed text-muted">신청 후 심사위원 평가와 운영자 승인을 거쳐 발급돼요. 진행 상황은 마이 러닝 › 인증서에서 볼 수 있어요.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
