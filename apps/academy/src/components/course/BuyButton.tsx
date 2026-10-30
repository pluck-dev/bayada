import Link from "next/link";
import { buttonVariants } from "@bayada/ui";

/** 유료 프로그램 구매 → 결제 페이지 (비로그인은 결제 페이지가 로그인으로 보낸다) */
export function BuyButton({ locale, slug }: { locale: string; slug: string }) {
  return (
    <Link
      href={`/${locale}/checkout?course=${encodeURIComponent(slug)}`}
      className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
    >
      구매하기
    </Link>
  );
}
