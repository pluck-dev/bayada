import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, CircleDashed, ClipboardCheck, Lock, RefreshCw } from "lucide-react";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { getProgramDetail } from "@/lib/queries/credentials";
import { APP_STATUS_CLASS, APP_STATUS_LABEL, credentialState, daysLeft, validityText } from "@/lib/credentials";
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
    <div className="container-page pb-24 pt-8 md:pt-10">
      <nav aria-label="현재 위치" className="text-xs text-muted">
        <Link href={`/${locale}`} className="hover:text-ink">
          홈
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/${locale}/certifications`} className="hover:text-ink">
          바야다 인증
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-soft">{p.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> 바야다 인증
          </span>
          <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[40px]">{p.title}</h1>
          {p.summary && <p className="mt-4 text-[17px] leading-relaxed text-muted">{p.summary}</p>}

          <dl className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface py-5">
            {[
              ["선수 프로그램", `${prerequisites.length}개`],
              ["평가", p.practicalRequired ? "시험 + 실기" : "시험"],
              ["유효기간", p.validityMonths == null ? "영구" : validityText(p.validityMonths).replace("발급일로부터 ", "")],
            ].map(([k, v]) => (
              <div key={k} className="px-5">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-1 text-lg font-bold tracking-tight text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {p.description && (
            <section className="mt-12">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">인증 소개</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{p.description}</p>
            </section>
          )}

          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">신청 자격 · 선수 프로그램</h2>
              {viewer && (
                <span className={`text-sm font-semibold ${done === prerequisites.length ? "text-success" : "text-ink-soft"}`}>
                  {done}/{prerequisites.length} 수료
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">아래 프로그램을 모두 수료하면 인증을 신청할 수 있어요.</p>
            <ul className="mt-5 divide-y divide-line-soft rounded-2xl border border-line">
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
                      <Link href={`/${locale}/courses/${encodeURIComponent(r.slug!)}`} className="text-[15px] font-semibold text-ink hover:text-brand">
                        {i + 1}. {r.title}
                      </Link>
                    ) : (
                      <p className="text-[15px] font-semibold text-ink-soft">{i + 1}. 임직원 전용 프로그램</p>
                    )}
                    {viewer && r.enrolled && !r.completedAt && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 max-w-[240px] flex-1 overflow-hidden rounded-full bg-line-soft">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${r.progressPercent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink">{r.progressPercent}%</span>
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted">
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

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">평가 기준</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line p-5">
                <p className="text-xs text-muted">필기 시험</p>
                <p className="mt-1 text-lg font-bold text-ink">{p.examPassingScore}점 이상 합격</p>
                <p className="mt-1 text-xs text-muted">100점 만점</p>
              </div>
              <div className="rounded-2xl border border-line p-5">
                <p className="text-xs text-muted">실기 평가</p>
                <p className="mt-1 text-lg font-bold text-ink">{p.practicalRequired ? `${p.practicalPassingScore}점 이상 합격` : "없음"}</p>
                <p className="mt-1 text-xs text-muted">{p.practicalRequired ? "심사위원 현장 평가 · 100점 만점" : "필기 시험만으로 판정해요"}</p>
              </div>
            </div>
            {p.criteria && (
              <div className="mt-3 rounded-2xl bg-surface p-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <ClipboardCheck className="h-4 w-4 text-brand" aria-hidden /> 세부 평가 기준
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.criteria}</p>
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">유효기간 · 갱신</h2>
            <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-ink-soft">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden />
                유효기간: {validityText(p.validityMonths)}
              </li>
              {p.validityMonths != null && (
                <li className="flex gap-2">
                  <RefreshCw className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  만료 {p.renewalNoticeDays}일 전부터 마이 러닝에서 갱신 안내를 드리고, 같은 페이지에서 갱신 신청할 수 있어요.
                </li>
              )}
              <li className="flex gap-2">
                <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden />
                인증번호와 QR로 누구나 공개 검증 페이지에서 유효 여부를 확인할 수 있어요.
              </li>
            </ul>
          </section>
        </div>

        <aside>
          <div className="space-y-4 lg:sticky lg:top-[124px]">
            {current && (
              <div className={`rounded-2xl p-5 ${currentState === "expiring" ? "bg-amber-50" : "bg-success-soft"}`}>
                <p className={`flex items-center gap-1.5 text-sm font-semibold ${currentState === "expiring" ? "text-amber-800" : "text-success"}`}>
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  {currentState === "expiring" && current.expiresAt ? `만료 ${daysLeft(current.expiresAt, now)}일 전` : "인증 보유 중"}
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-ink">{current.number}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(current.issuedAt)} 발급 · {current.expiresAt ? `${formatDate(current.expiresAt)}까지` : "영구"}
                </p>
                <Link href={`/${locale}/credentials/${current.number}/print`} className="mt-3 inline-flex text-sm font-semibold text-ink hover:text-brand">
                  인증서 보기 →
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <p className="text-lg font-bold text-ink">{eligibility.ok && eligibility.renewal ? "갱신 신청" : "인증 신청"}</p>
              {latest && (
                <div className="mt-4 rounded-xl bg-surface px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">{formatDate(latest.createdAt)} 신청</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${APP_STATUS_CLASS[latest.status]}`}>
                      {APP_STATUS_LABEL[latest.status]}
                    </span>
                  </div>
                  {latest.status === "REJECTED" && latest.decisionNote && (
                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-ink-soft">반려 사유: {latest.decisionNote}</p>
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
              <p className="mt-4 text-xs leading-relaxed text-muted">신청 후 심사위원 평가와 운영자 승인을 거쳐 발급돼요. 진행 상황은 마이 러닝 › 인증서에서 볼 수 있어요.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
