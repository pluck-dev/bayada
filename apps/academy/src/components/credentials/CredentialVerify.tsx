import Link from "next/link";
import { BadgeCheck, Ban, Clock, SearchX } from "lucide-react";
import { getCredentialByNumber } from "@/lib/queries/credentials";
import { credentialState } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { maskName } from "@/lib/params";
import { CertificateQr } from "@/components/dashboard/CertificateQr";
import { certificateVerifyUrl } from "@/lib/qr";

/** 공개 검증 — 바야다 인증(BC-) 번호. 유효 / 만료 / 취소 상태를 구분해 보여 준다 (게스트 접근) */
export async function CredentialVerify({ locale, number }: { locale: string; number: string }) {
  const c = await getCredentialByNumber(number);

  if (!c) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
            <SearchX className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">인증서를 찾을 수 없어요</h1>
          <p className="mt-2 text-[15px] text-muted">
            <span className="font-mono text-ink-soft">{number}</span> 번호로 발급된 바야다 인증이 없어요. 번호를 다시 확인해 주세요.
          </p>
          <Link
            href={`/${locale}/verify`}
            className="mt-8 inline-flex rounded-full border border-ink px-5 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
          >
            다른 번호 확인
          </Link>
        </div>
      </div>
    );
  }

  // 공개 검증에는 갱신 알림 기간 개념이 없다 (알림 기간 0 → valid/expired/revoked 만 나옴)
  const state = credentialState(c, 0);
  const valid = { bg: "bg-success-soft", icon: BadgeCheck, iconCls: "text-success", title: "유효한 바야다 인증입니다", body: "바야다홈헬스케어가 평가를 거쳐 발급한 인증이 맞아요." };
  const view = {
    valid,
    expiring: valid,
    expired: { bg: "bg-line-soft", icon: Clock, iconCls: "text-muted", title: "유효기간이 지난 인증입니다", body: "발급 사실은 맞지만 현재는 효력이 없어요." },
    revoked: { bg: "bg-brand-soft", icon: Ban, iconCls: "text-brand", title: "취소된 인증입니다", body: "발급 기관이 이 인증을 취소해 효력이 없어요." },
  }[state];
  const Icon = view.icon;
  const rows: [string, string][] = [
    ["취득자", maskName(c.user.name)],
    ["인증 유형", `바야다 인증 (${c.program.practicalRequired ? "시험·실기 평가 합격" : "시험 평가 합격"})`],
    ["인증명", c.program.title],
    ["인증번호", c.number],
    ["발급일", formatDate(c.issuedAt)],
    ["유효기간", c.expiresAt ? `${formatDate(c.expiresAt)}까지` : "영구"],
    ...(c.revokedAt ? ([["취소일", formatDate(c.revokedAt)]] as [string, string][]) : []),
    ["발급기관", "바야다홈헬스케어 · BAYADA Academy"],
  ];

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
          <div className={`flex items-center gap-4 px-8 py-7 ${view.bg}`}>
            <Icon className={`h-10 w-10 shrink-0 ${view.iconCls}`} aria-hidden />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink">{view.title}</h1>
              <p className="mt-1 text-sm text-ink-soft">{view.body}</p>
            </div>
          </div>
          <div className="flex gap-6 px-8">
            <dl className="min-w-0 flex-1 divide-y divide-line-soft">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-6 py-4 text-[15px]">
                  <dt className="w-20 shrink-0 text-muted">{k}</dt>
                  <dd className={`font-semibold ${k === "인증번호" ? "font-mono" : ""} ${k === "취소일" ? "text-brand" : "text-ink"}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="hidden shrink-0 pt-5 sm:block">
              <CertificateQr url={certificateVerifyUrl(locale, c.number)} className={`h-24 w-24 ${state === "valid" ? "" : "opacity-40"}`} />
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-muted">개인정보 보호를 위해 취득자 이름 일부를 가렸어요.</p>
      </div>
    </div>
  );
}
