import Link from "next/link";
import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { prisma } from "@bayada/db";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "결제 실패", robots: { index: false, follow: false } };

type SP = Promise<{ code?: string; message?: string; orderId?: string }>;

/** 토스 failUrl — ?code=&message=&orderId= (구매자가 결제창을 닫으면 orderId 없이 PAY_PROCESS_CANCELED) */
export default async function CheckoutFailPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  const { code, message, orderId } = await searchParams;
  const base = `/${locale}`;
  const canceled = code === "PAY_PROCESS_CANCELED";

  // 승인 전 실패라 청구된 돈은 없다 — 남은 결제 대기 주문은 취소로 정리
  const viewer = await getViewer();
  let retry = `${base}/courses`;
  if (viewer && orderId) {
    const order = await prisma.order.findUnique({
      where: { orderNo: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        items: { select: { course: { select: { slug: true } }, passPlanId: true }, take: 1 },
      },
    });
    if (order && order.userId === viewer.id) {
      if (order.status === "PENDING") {
        await prisma.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "CANCELLED" } });
      }
      const it = order.items[0];
      if (it?.course) retry = `${base}/checkout?course=${encodeURIComponent(it.course.slug)}`;
      else if (it?.passPlanId) retry = `${base}/checkout?plan=${encodeURIComponent(it.passPlanId)}`;
    }
  }

  return (
    <div className="container-page py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          {canceled ? "결제를 취소했어요" : "결제에 실패했어요"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {canceled ? "결제가 진행되지 않았어요. 언제든 다시 시도할 수 있어요." : (message ?? "알 수 없는 오류가 발생했어요.")}
        </p>
        {code && !canceled && <p className="mt-1 font-mono text-xs text-subtle">{code}</p>}
        <p className="mt-1 text-sm text-subtle">청구된 금액은 없어요.</p>
        <div className="mt-8 flex gap-2">
          <Link href={`${base}/pass`} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink">
            아카데미 패스
          </Link>
          <Link href={retry} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft">
            다시 시도하기
          </Link>
        </div>
      </div>
    </div>
  );
}
