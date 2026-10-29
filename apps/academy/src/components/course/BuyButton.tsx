import Link from "next/link";

/** 유료 프로그램 구매 → 결제 페이지 (비로그인은 결제 페이지가 로그인으로 보낸다) */
export function BuyButton({ locale, slug }: { locale: string; slug: string }) {
  return (
    <Link
      href={`/${locale}/checkout?course=${encodeURIComponent(slug)}`}
      className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
    >
      구매하기
    </Link>
  );
}
