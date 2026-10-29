import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, SearchX } from "lucide-react";
import { getCertificateByNumber } from "@/lib/queries/learning";
import { formatDate } from "@/lib/labels";
import { decodeParam, maskName } from "@/lib/params";

export const metadata: Metadata = { title: "수료증 검증", robots: { index: false, follow: false } };

export default async function VerifyPage({ params }: { params: Promise<{ locale: string; number: string }> }) {
  const { locale, number: rawNumber } = await params;
  const number = decodeParam(rawNumber).trim().toUpperCase();
  const cert = await getCertificateByNumber(number);

  if (!cert) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
            <SearchX className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">수료증을 찾을 수 없어요</h1>
          <p className="mt-2 text-[15px] text-muted">
            <span className="font-mono text-ink-soft">{number}</span> 번호로 발급된 수료증이 없어요. 번호를 다시 확인해 주세요.
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

  const valid = !cert.expiresAt || cert.expiresAt > new Date();
  const rows = [
    ["수료자", maskName(cert.user.name)],
    ["프로그램", cert.course.title],
    ["수료번호", cert.number],
    ["발급일", formatDate(cert.issuedAt)],
    ["유효기간", cert.expiresAt ? `${formatDate(cert.expiresAt)}까지` : "제한 없음"],
    ["발급기관", `BAYADA Academy · ${cert.course.provider?.name ?? "바야다홈헬스케어"}`],
  ];

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
          <div className={`flex items-center gap-4 px-8 py-7 ${valid ? "bg-success-soft" : "bg-brand-soft"}`}>
            <BadgeCheck className={`h-10 w-10 shrink-0 ${valid ? "text-success" : "text-brand"}`} aria-hidden />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink">
                {valid ? "유효한 수료증입니다" : "유효기간이 지난 수료증입니다"}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">BAYADA Academy가 발급한 수료증이 맞아요.</p>
            </div>
          </div>
          <dl className="divide-y divide-line-soft px-8">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-6 py-4 text-[15px]">
                <dt className="w-20 shrink-0 text-muted">{k}</dt>
                <dd className={`font-semibold text-ink ${k === "수료번호" ? "font-mono" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-5 text-center text-xs text-muted">개인정보 보호를 위해 수료자 이름 일부를 가렸어요.</p>
      </div>
    </div>
  );
}
