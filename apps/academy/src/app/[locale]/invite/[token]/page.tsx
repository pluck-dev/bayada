import Link from "next/link";
import type { Metadata } from "next";
import { Building2, LinkIcon, MailWarning } from "lucide-react";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { decodeParam } from "@/lib/params";
import { AcceptInviteButton } from "@/components/business/AcceptInviteButton";

export const metadata: Metadata = { title: "기관 초대", robots: { index: false, follow: false } };

/** 이메일 가운데를 가린다: kim.minsu@center.kr → ki*****u@center.kr */
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(1, local.length - 3))}${local.slice(-1)}@${domain}`;
}

function Shell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="container-page py-20 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-line bg-white px-8 py-10 text-center shadow-card">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink-soft">{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token: rawToken } = await params;
  const token = decodeParam(rawToken);
  const selfPath = `/${locale}/invite/${encodeURIComponent(token)}`;
  const [invite, viewer] = await Promise.all([
    prisma.orgInvite.findUnique({
      where: { token },
      select: { email: true, acceptedAt: true, organization: { select: { id: true, name: true, isInternal: true } } },
    }),
    getViewer(),
  ]);

  if (!invite || invite.acceptedAt) {
    const joined = invite && viewer?.organizationId === invite.organization.id;
    return (
      <Shell icon={<LinkIcon className="h-6 w-6" aria-hidden />}>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          {joined ? "이미 합류한 기관이에요" : "사용할 수 없는 초대 링크예요"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {joined
            ? `${invite.organization.name} 소속으로 학습하고 있어요.`
            : "이미 사용됐거나 기관 관리자가 취소한 링크예요. 새 초대 링크를 요청해 주세요."}
        </p>
        <Link
          href={`/${locale}${joined ? "/dashboard" : ""}`}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
        >
          {joined ? "마이 러닝으로" : "홈으로"}
        </Link>
      </Shell>
    );
  }

  const orgName = invite.organization.name;
  const heading = (
    <>
      <p className="mt-6 text-sm font-semibold text-muted">기관 초대</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
        {orgName}에서
        <br />
        함께 학습하자고 초대했어요
      </h1>
    </>
  );

  if (!viewer) {
    const cb = encodeURIComponent(selfPath);
    return (
      <Shell icon={<Building2 className="h-6 w-6" aria-hidden />}>
        {heading}
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          초대받은 이메일(<span className="font-medium text-ink-soft">{maskEmail(invite.email)}</span>)로 로그인하거나
          가입하면 기관에 합류해 배정된 교육을 들을 수 있어요.
        </p>
        <div className="mt-8 grid w-full gap-2">
          <Link
            href={`/${locale}/auth/login?callbackUrl=${cb}`}
            className="flex h-12 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white hover:bg-brand-strong"
          >
            로그인하고 합류하기
          </Link>
          <Link
            href={`/${locale}/auth/register?callbackUrl=${cb}`}
            className="flex h-12 items-center justify-center rounded-xl border border-line text-[15px] font-semibold text-ink hover:border-ink"
          >
            처음이에요 · 무료 가입
          </Link>
        </div>
      </Shell>
    );
  }

  if (viewer.email.toLowerCase() !== invite.email) {
    return (
      <Shell icon={<MailWarning className="h-6 w-6" aria-hidden />}>
        {heading}
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          이 초대는 <span className="font-medium text-ink-soft">{maskEmail(invite.email)}</span> 계정용이에요. 지금은{" "}
          <span className="font-medium text-ink-soft">{viewer.email}</span>로 로그인돼 있어요. 초대받은 이메일로 다시
          로그인해 주세요.
        </p>
        <Link href={`/${locale}`} className="mt-8 text-sm font-semibold text-muted hover:text-ink">
          홈으로
        </Link>
      </Shell>
    );
  }

  const moving = viewer.organizationId && viewer.organizationId !== invite.organization.id;
  return (
    <Shell icon={<Building2 className="h-6 w-6" aria-hidden />}>
      {heading}
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        합류하면 기관 관리자가 배정한 교육과 이수 현황을 기관에서 함께 관리해요.
      </p>
      {moving && (
        <p className="mt-4 w-full rounded-xl bg-brand-soft px-4 py-3 text-left text-sm text-brand">
          지금 소속된 <strong>{viewer.organizationName}</strong>에서 <strong>{orgName}</strong>(으)로 소속이 바뀌어요.
          {viewer.isInternal &&
            !invite.organization.isInternal &&
            " 바야다 사내 전용 프로그램은 더 이상 보이지 않아요(수강 중인 프로그램은 계속 들을 수 있어요)."}
        </p>
      )}
      <div className="mt-8 w-full">
        <AcceptInviteButton token={token} locale={locale} />
      </div>
    </Shell>
  );
}
