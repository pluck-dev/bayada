import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { prisma } from "@bayada/db";
import { ServiceError } from "@bayada/services";
import { getViewer } from "@/lib/viewer";
import { paymentService } from "@/lib/services";
import { formatDate, formatPrice } from "@/lib/labels";

export const metadata: Metadata = { title: "결제 완료", robots: { index: false, follow: false } };

type SP = Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;

/**
 * 토스 successUrl. 서버에서 금액 검증 → 승인 API → 주문 확정·수강권 지급.
 * 새로고침해도 같은 결제면 다시 지급하지 않는다(멱등).
 */
export default async function CheckoutSuccessPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  const { paymentKey, orderId, amount } = await searchParams;
  const base = `/${locale}`;
  const viewer = await getViewer();
  if (!viewer) {
    const self = `${base}/checkout/success?${new URLSearchParams({ paymentKey: paymentKey ?? "", orderId: orderId ?? "", amount: amount ?? "" })}`;
    redirect(`${base}/auth/login?callbackUrl=${encodeURIComponent(self)}`);
  }

  let error: string | null = null;
  let confirmedId: string | null = null;
  if (!paymentKey || !orderId || !amount) {
    error = "결제 정보가 올바르지 않아요.";
  } else {
    try {
      const r = await paymentService.confirmPayment({ userId: viewer.id, orderNo: orderId, paymentKey, amount: Number(amount) });
      confirmedId = r.orderId;
    } catch (e) {
      error = e instanceof ServiceError ? e.message : "결제 승인 중 오류가 발생했어요.";
      if (!(e instanceof ServiceError)) console.error("[checkout] confirm", e);
    }
  }

  if (error || !confirmedId) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <AlertCircle className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">결제를 완료하지 못했어요</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{error}</p>
          <p className="mt-1 text-sm text-subtle">승인되지 않은 결제는 청구되지 않아요.</p>
          <div className="mt-8 flex gap-2">
            <Link href={`${base}/orders`} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink">
              결제 내역
            </Link>
            <Link href={`${base}/courses`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft">
              프로그램 둘러보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: confirmedId },
    include: {
      items: { include: { course: { select: { title: true, slug: true } }, passPlan: { select: { name: true } } } },
      subscription: { select: { endsAt: true } },
    },
  });
  const item = order.items[0];
  const course = item?.course;

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-[520px]">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink md:text-[28px]">결제가 완료됐어요</h1>
          <p className="mt-2 text-[15px] text-muted">
            {course ? "지금 바로 학습을 시작할 수 있어요." : "아카데미 패스를 바로 이용할 수 있어요."}
          </p>
        </div>
        <dl className="mt-8 grid grid-cols-[96px_1fr] gap-y-3 rounded-2xl border border-line bg-white p-6 text-sm">
          <dt className="text-muted">상품</dt>
          <dd className="font-semibold text-ink">{course ? course.title : `아카데미 패스 · ${item?.passPlan?.name ?? ""}`}</dd>
          {order.subscription && (
            <>
              <dt className="text-muted">이용 기간</dt>
              <dd className="text-ink">{formatDate(order.subscription.endsAt)}까지</dd>
            </>
          )}
          <dt className="text-muted">결제 금액</dt>
          <dd className="font-semibold text-ink">{formatPrice(order.totalAmount)}</dd>
          <dt className="text-muted">결제 수단</dt>
          <dd className="text-ink">{order.paymentMethod ?? "-"}</dd>
          <dt className="text-muted">주문 번호</dt>
          <dd className="font-mono text-[13px] text-ink">{order.orderNo}</dd>
        </dl>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link
            href={`${base}/orders/${order.id}`}
            className="flex h-12 items-center justify-center rounded-xl border border-line text-[15px] font-semibold text-ink hover:border-ink"
          >
            결제 내역 보기
          </Link>
          <Link
            href={course ? `${base}/courses/${encodeURIComponent(course.slug)}` : `${base}/courses`}
            className="flex h-12 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white hover:bg-brand-strong"
          >
            {course ? "학습 시작하기" : "프로그램 둘러보기"}
          </Link>
        </div>
      </div>
    </div>
  );
}
