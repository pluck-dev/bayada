import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "무료 멤버십 | BAYADA", description: "기본 정보를 입력하고 무료 멤버십을 시작하세요" };

export default async function FreeOnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero title="무료 멤버십" subtitle="기본 정보를 입력하고 시작하세요" />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">1</div>
            <div className="h-0.5 w-8 bg-[color:var(--border)]" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface)] text-sm font-bold text-[color:var(--muted)]">2</div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] p-8">
            <h2 className="text-lg font-bold text-[color:var(--fg)]">Step 1: 기본 정보 입력</h2>
            <div className="mt-6 space-y-4">
              {["이름 *", "연락처 *", "이메일"].map((label) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-[color:var(--fg)]">{label}</label>
                  <input type="text" className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none" placeholder={label.replace(" *", "")} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">기본 건강 정보 (선택)</label>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {["당뇨", "고혈압", "치매", "기타"].map((c) => (
                    <label key={c} className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#ce0e2d]" /> {c}</label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">장기요양등급</label>
                <div className="mt-2 flex gap-4 text-sm">
                  {["예", "아니오", "모름"].map((o) => (
                    <label key={o} className="flex items-center gap-1.5"><input type="radio" name="ltci" className="accent-[#ce0e2d]" /> {o}</label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]">다음 →</button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
