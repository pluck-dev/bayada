import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "수료증·인증서 검증" };

export default async function VerifyIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ number?: string }>;
}) {
  const { locale } = await params;
  const { number } = await searchParams;
  const n = number?.trim().toUpperCase();
  if (n) redirect(`/${locale}/verify/${encodeURIComponent(n)}`);

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-[28px] font-bold tracking-tight text-ink">수료증·인증서 검증</h1>
        <p className="mt-2 text-[15px] text-muted">수료증(BA-)이나 바야다 인증서(BC-)에 적힌 번호를 입력하면 발급 사실과 유효 여부를 확인할 수 있어요.</p>
        <form className="mt-8 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">수료번호 또는 인증번호</span>
            <input
              name="number"
              required
              placeholder="BA-2026-000123"
              className="h-12 w-full rounded-xl border border-line px-4 font-mono text-[15px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none"
            />
          </label>
          <button type="submit" className="h-12 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft">
            확인
          </button>
        </form>
      </div>
    </div>
  );
}
