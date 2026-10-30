import { buttonVariants } from "@bayada/ui";
import Link from "next/link";
import { Infinity as InfinityIcon } from "lucide-react";
import { getMyPass } from "@/lib/queries/pass";
import { PRODUCT_TYPE_LABEL, formatDate } from "@/lib/labels";

/** 마이 러닝 — 이용 중인 아카데미 패스 (없으면 렌더하지 않음) */
export async function PassCard({ userId, locale }: { userId: string; locale: string }) {
  const pass = await getMyPass(userId);
  if (!pass) return null;
  const soon = pass.daysLeft <= 7;
  return (
    <section
      aria-label="이용 중인 아카데미 패스"
      className="mt-3 flex flex-col gap-4 rounded-xl border border-line bg-canvas p-5 sm:flex-row sm:items-center"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-soft">
        <InfinityIcon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption font-semibold text-success">아카데미 패스 이용 중</p>
        <p className="mt-0.5 text-body font-bold text-ink">{pass.planName}</p>
        <p className="mt-1 text-caption text-muted">
          {pass.includes.map((t) => PRODUCT_TYPE_LABEL[t]).join(" · ")} 무제한 · 만료일 {formatDate(pass.endsAt)}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:text-right">
        <p className={`text-body-sm font-bold ${soon ? "text-warning" : "text-ink"}`}>{pass.daysLeft}일 남음</p>
        <Link
          href={`/${locale}/pass`}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          {soon ? "연장하기" : "패스 안내"}
        </Link>
      </div>
    </section>
  );
}
