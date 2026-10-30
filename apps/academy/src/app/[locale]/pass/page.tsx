import { Badge, EmptyState, PageHeader, buttonVariants, cn } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, Infinity as InfinityIcon, Minus } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { formatPassDuration, getActivePlans, getMyPass } from "@/lib/queries/pass";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABEL, formatDate } from "@/lib/labels";

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
    <div className="container-page page-y">
      <PageHeader
        className="mx-auto max-w-[880px]"
        eyebrow="아카데미 패스"
        title="아카데미 패스로 마음껏 배우세요"
        description="이용 기간 동안 포함된 프로그램을 추가 결제 없이 수강할 수 있어요."
      />

      {myPass && (
        <div className="mx-auto flex max-w-[880px] flex-wrap items-center justify-between gap-3 rounded-xl bg-success-soft px-6 py-4 text-body-sm">
          <span className="text-ink-soft">
            <span className="font-semibold text-ink">{myPass.planName}</span> 이용 중 · {formatDate(myPass.endsAt)}까지 (
            {myPass.daysLeft}일 남음)
          </span>
          <Link href={`${base}/dashboard`} className="font-semibold text-ink underline-offset-4 hover:underline">
            마이 러닝 →
          </Link>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="mx-auto max-w-[880px]">
          <EmptyState
            framed
            icon={<InfinityIcon />}
            title="지금은 판매 중인 패스가 없어요"
            description="프로그램은 상세 페이지에서 하나씩 수강신청하거나 구매할 수 있어요."
            action={
<Link href={`${base}/courses`} className={buttonVariants({ variant: "secondary" })}>
프로그램 둘러보기
</Link>
}
          />
        </div>
      ) : (
        <>
          <ul
            className={`mx-auto mt-8 grid gap-6 ${plans.length === 1 ? "max-w-[440px]" : plans.length === 2 ? "max-w-[880px] md:grid-cols-2" : "max-w-[1100px] md:grid-cols-3"}`}
          >
            {plans.map((p) => {
              const featured = p.id === featuredId;
              return (
                <li
                  key={p.id}
                  className={cn("flex flex-col rounded-xl border bg-canvas p-7", featured ? "border-ink" : "border-line")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-h3 text-ink">{p.name}</h2>
                    {featured && <Badge tone="brand">추천</Badge>}
                  </div>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="tabular text-[30px] font-bold tracking-[-0.02em] text-ink">₩{p.price.toLocaleString("ko-KR")}</span>
                    <span className="text-body-sm text-muted">/ {formatPassDuration(p.durationDays)}</span>
                  </p>
                  {p.description && <p className="mt-3 whitespace-pre-line text-body-sm leading-relaxed text-muted">{p.description}</p>}
                  <ul className="mt-5 flex-1 space-y-2 text-body-sm text-ink-soft">
                    {p.includes.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" aria-hidden /> {PRODUCT_TYPE_LABEL[t]} 무제한
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" aria-hidden /> 자동 결제 없음 · 기간이 끝나면 종료
                    </li>
                  </ul>
                  <Link
                    href={`${base}/checkout?plan=${encodeURIComponent(p.id)}`}
                    className={cn(
                      buttonVariants({ variant: featured || plans.length === 1 ? "primary" : "secondary", size: "lg", fullWidth: true }),
                      "mt-7",
                    )}
                  >
                    {myPass ? "기간 연장하기" : "구독하기"}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-auto mt-12 max-w-[880px] overflow-hidden rounded-xl border border-line">
            <table className="w-full text-body-sm">
              <thead className="bg-surface text-left text-caption text-muted">
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
                  <tr key={t} className="border-t border-line">
                    <th scope="row" className="px-5 py-3.5 text-left font-semibold text-ink">
                      {PRODUCT_TYPE_LABEL[t]}
                    </th>
                    {plans.map((p) =>
                      p.includes.includes(t) ? (
                        <td key={p.id} className="px-5 py-3.5 font-medium text-ink">
                          <span className="inline-flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-success" aria-hidden /> 무제한
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
          <p className="mx-auto mt-4 max-w-[880px] text-caption leading-relaxed text-muted">
            사내 전용 프로그램은 임직원 계정에만 보여요. 패스 기간이 끝나면 패스로 수강하던 프로그램은 잠기고, 다시 구독하면 학습 기록 그대로 이어서 들을 수 있어요.
          </p>
        </>
      )}
    </div>
  );
}
