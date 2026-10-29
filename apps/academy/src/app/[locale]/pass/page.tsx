import Link from "next/link";
import type { Metadata } from "next";
import { Check, Infinity as InfinityIcon, Minus } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { formatPassDuration, getActivePlans, getMyPass } from "@/lib/queries/pass";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABEL, formatDate } from "@/lib/labels";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "아카데미 패스",
  description: "기간 동안 포함된 프로그램을 추가 결제 없이 마음껏 수강하세요.",
};

export default async function PassPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const viewer = await getViewer();
  const [plans, myPass] = await Promise.all([getActivePlans(), viewer ? getMyPass(viewer.id) : Promise.resolve(null)]);
  // 요금제가 여럿이면 가장 긴 기간을 추천으로 강조 (피그마 W11 — 연간 강조)
  const featuredId = plans.length > 1 ? [...plans].sort((a, b) => b.durationDays - a.durationDays)[0]!.id : null;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-[880px] text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          <InfinityIcon className="h-3.5 w-3.5" aria-hidden /> 아카데미 패스
        </p>
        <h1 className="mt-4 text-[30px] font-bold tracking-[-0.02em] text-ink md:text-[40px]">아카데미 패스로 마음껏 배우세요</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          이용 기간 동안 포함된 프로그램을 추가 결제 없이 수강할 수 있어요.
        </p>
      </div>

      {myPass && (
        <div className="mx-auto mt-8 flex max-w-[880px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-6 py-4 text-sm">
          <span className="text-ink-soft">
            <span className="font-semibold text-ink">{myPass.planName}</span> 이용 중 · {formatDate(myPass.endsAt)}까지 (
            {myPass.daysLeft}일 남음)
          </span>
          <Link href={`${base}/dashboard`} className="font-semibold text-ink hover:text-brand">
            마이 러닝 →
          </Link>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="mx-auto mt-10 max-w-[880px]">
          <EmptyState
            icon={<InfinityIcon className="h-5 w-5" />}
            title="지금은 판매 중인 패스가 없어요"
            description="프로그램은 상세 페이지에서 하나씩 수강신청하거나 구매할 수 있어요."
            action={{ label: "프로그램 둘러보기", href: `${base}/courses` }}
          />
        </div>
      ) : (
        <>
          <ul
            className={`mx-auto mt-10 grid gap-5 ${plans.length === 1 ? "max-w-[440px]" : plans.length === 2 ? "max-w-[880px] md:grid-cols-2" : "max-w-[1100px] md:grid-cols-3"}`}
          >
            {plans.map((p) => {
              const featured = p.id === featuredId;
              return (
                <li
                  key={p.id}
                  className={`flex flex-col rounded-2xl bg-white p-7 ${featured ? "border-2 border-ink shadow-lift" : "border border-line"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-ink">{p.name}</h2>
                    {featured && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">추천</span>}
                  </div>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-[30px] font-bold tracking-[-0.02em] text-ink">₩{p.price.toLocaleString("ko-KR")}</span>
                    <span className="text-sm text-muted">/ {formatPassDuration(p.durationDays)}</span>
                  </p>
                  {p.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{p.description}</p>}
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-soft">
                    {p.includes.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand" aria-hidden /> {PRODUCT_TYPE_LABEL[t]} 무제한
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-brand" aria-hidden /> 자동 결제 없음 · 기간이 끝나면 종료
                    </li>
                  </ul>
                  <Link
                    href={`${base}/checkout?plan=${encodeURIComponent(p.id)}`}
                    className={`mt-7 flex h-12 items-center justify-center rounded-xl text-[15px] font-semibold transition-colors ${
                      featured ? "bg-ink text-white hover:bg-ink-soft" : "border border-line text-ink hover:border-ink"
                    }`}
                  >
                    {myPass ? "기간 연장하기" : "구독하기"}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-auto mt-12 max-w-[880px] overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    포함 범위
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-5 py-3 font-medium">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCT_TYPES.map((t) => (
                  <tr key={t} className="border-t border-line-soft">
                    <th scope="row" className="px-5 py-3.5 text-left font-semibold text-ink">
                      {PRODUCT_TYPE_LABEL[t]}
                    </th>
                    {plans.map((p) =>
                      p.includes.includes(t) ? (
                        <td key={p.id} className="px-5 py-3.5 font-medium text-ink">
                          <span className="inline-flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-brand" aria-hidden /> 무제한
                          </span>
                        </td>
                      ) : (
                        <td key={p.id} className="px-5 py-3.5 text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <Minus className="h-4 w-4" aria-hidden /> 별도 결제
                          </span>
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-4 max-w-[880px] text-xs leading-relaxed text-muted">
            사내 전용 프로그램은 임직원 계정에만 보여요. 패스 기간이 끝나면 패스로 수강하던 프로그램은 잠기고, 다시 구독하면 학습 기록 그대로 이어서 들을 수 있어요.
          </p>
        </>
      )}
    </div>
  );
}
