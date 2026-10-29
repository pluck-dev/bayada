import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import { prisma } from "@bayada/db";
import { isTossTestMode, tossClientKey } from "@bayada/services";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";
import { formatPassDuration, getMyPass } from "@/lib/queries/pass";
import { paymentService } from "@/lib/services";
import { PRODUCT_TYPE_LABEL, formatDate, formatPrice } from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { CourseThumb } from "@/components/course/CourseThumb";
import { TossPayButton } from "@/components/checkout/TossPayButton";

export const metadata: Metadata = { title: "결제하기", robots: { index: false, follow: false } };

type SP = Promise<{ course?: string; plan?: string }>;

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  const sp = await searchParams;
  const base = `/${locale}`;
  const self = sp.course
    ? `${base}/checkout?course=${encodeURIComponent(sp.course)}`
    : `${base}/checkout?plan=${encodeURIComponent(sp.plan ?? "")}`;

  const viewer = await getViewer();
  if (!viewer) redirect(`${base}/auth/login?callbackUrl=${encodeURIComponent(self)}`);

  let item: {
    target: { courseId: string } | { planId: string };
    title: string;
    kind: string;
    price: number;
    thumb?: { src: string | null; label?: string };
    lines: string[];
    back: { href: string; label: string };
  };

  if (sp.course) {
    const course = await prisma.course.findUnique({
      where: { slug: decodeParam(sp.course) },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        status: true,
        visibility: true,
        productType: true,
        thumbnail: true,
        category: { select: { name: true } },
        provider: { select: { name: true } },
      },
    });
    if (!course || !isCourseListed(course, viewer)) notFound();
    const detail = `${base}/courses/${encodeURIComponent(course.slug)}`;
    if (course.price <= 0) redirect(detail);
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
      select: { id: true },
    });
    if (enrollment && (await paymentService.enrollmentActive(enrollment.id, viewer.id, course))) redirect(detail);
    item = {
      target: { courseId: course.id },
      title: course.title,
      kind: PRODUCT_TYPE_LABEL[course.productType],
      price: course.price,
      thumb: { src: course.thumbnail, label: course.category?.name },
      lines: [course.provider?.name ? `제공 ${course.provider.name}` : null, "결제 즉시 수강 시작 · 수강 기간 제한 없음", "수료 시 수료증 발급"].filter(
        (l): l is string => !!l
      ),
      back: { href: detail, label: "프로그램으로 돌아가기" },
    };
  } else if (sp.plan) {
    const plan = await prisma.passPlan.findUnique({ where: { id: sp.plan } });
    if (!plan || !plan.active || plan.price <= 0) notFound();
    const myPass = await getMyPass(viewer.id);
    const sameActive = await prisma.subscription.findFirst({
      where: { userId: viewer.id, planId: plan.id, canceledAt: null, endsAt: { gt: new Date() } },
      orderBy: { endsAt: "desc" },
      select: { endsAt: true },
    });
    const endsAt = new Date((sameActive?.endsAt ?? new Date()).getTime() + plan.durationDays * 86_400_000);
    item = {
      target: { planId: plan.id },
      title: `아카데미 패스 · ${plan.name}`,
      kind: `${formatPassDuration(plan.durationDays)} 이용권`,
      price: plan.price,
      lines: [
        `${plan.includes.map((t) => PRODUCT_TYPE_LABEL[t]).join(" · ")} 무제한 수강`,
        sameActive
          ? `이용 중인 패스에 이어서 연장 · ${formatDate(endsAt)}까지`
          : `결제 즉시 이용 시작 · ${formatDate(endsAt)}까지`,
        "자동 결제되지 않아요 · 기간이 끝나면 다시 구독",
      ],
      back: { href: `${base}/pass`, label: "패스 요금제로 돌아가기" },
    };
    if (myPass && !sameActive) {
      item.lines.push(`현재 이용 중: ${myPass.planName} (${formatDate(myPass.endsAt)}까지)`);
    }
  } else {
    notFound();
  }

  const clientKey = tossClientKey();
  const refund = await prisma.page.findUnique({ where: { slug: "refund" }, select: { id: true } });
  const refundHref = refund ? `${base}/refund` : null;
  const isPlan = "planId" in item.target;

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-[960px]">
        <Link href={item.back.href} className="text-sm text-muted hover:text-ink">
          ← {item.back.label}
        </Link>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-ink md:text-[34px]">결제하기</h1>
        {isTossTestMode() && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            테스트 결제 환경이에요. 결제창에서 결제해도 실제로 돈이 빠져나가지 않아요.
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section aria-labelledby="order-title" className="rounded-2xl border border-line bg-white p-6">
            <h2 id="order-title" className="text-base font-bold text-ink">
              주문 상품
            </h2>
            <div className="mt-5 flex gap-4">
              <div className="aspect-[16/9] w-36 shrink-0 overflow-hidden rounded-xl bg-line-soft sm:w-44">
                {item.thumb ? (
                  <CourseThumb src={item.thumb.src} title={item.title} label={item.thumb.label} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-ink text-white">
                    <InfinityIcon className="h-8 w-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand">{item.kind}</p>
                <p className="mt-1 text-[17px] font-bold leading-snug text-ink">{item.title}</p>
                <p className="mt-2 text-lg font-bold text-ink">{formatPrice(item.price)}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2 border-t border-line-soft pt-5 text-sm text-ink-soft">
              {item.lines.map((l) => (
                <li key={l} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {l}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-[88px_1fr] gap-y-2 border-t border-line-soft pt-5 text-sm">
              <dt className="text-muted">주문자</dt>
              <dd className="text-ink">{viewer.name ?? viewer.email.split("@")[0]}</dd>
              <dt className="text-muted">이메일</dt>
              <dd className="text-ink">{viewer.email}</dd>
            </dl>
          </section>

          <aside>
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card lg:sticky lg:top-[124px]">
              <h2 className="text-base font-bold text-ink">결제 금액</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">상품 금액</dt>
                  <dd className="text-ink">{formatPrice(item.price)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line-soft pt-3">
                  <dt className="font-semibold text-ink">총 결제 금액</dt>
                  <dd className="text-2xl font-bold tracking-tight text-ink">{formatPrice(item.price)}</dd>
                </div>
              </dl>
              <div className="mt-6">
                {clientKey ? (
                  <TossPayButton
                    clientKey={clientKey}
                    customerKey={viewer.id}
                    target={item.target}
                    locale={locale}
                    amountLabel={formatPrice(item.price)}
                    customerEmail={viewer.email}
                    customerName={viewer.name}
                    refundHref={refundHref}
                  />
                ) : (
                  <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
                    지금은 온라인 결제를 받을 수 없어요. 잠시 후 다시 시도해 주세요.
                  </p>
                )}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> 토스페이먼츠 결제창에서 카드·간편결제로 안전하게 결제돼요.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
