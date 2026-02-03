import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { membershipFeatures, membershipBenefits } from "@/data/membership";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata = createMetadata({
  title: "멤버십",
  description:
    "나에게 맞는 BAYADA 멤버십을 선택하세요. 무료/유료 멤버십으로 맞춤 홈헬스케어 서비스를 이용할 수 있습니다.",
  path: "/ko/membership",
});

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero title="BAYADA Membership" subtitle="나에게 맞는 멤버십을 선택하세요" />
      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 멤버십 유형 선택 */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--border)] p-8 text-center">
              <h3 className="text-lg font-bold text-[color:var(--fg)]">이용자 멤버십</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">서비스를 이용하려는 개인/가족/보호자</p>
              <Link href={`/${locale}/who-we-serve/users`} className="mt-6 inline-block text-sm font-medium text-[#ce0e2d]">자세히 보기 →</Link>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] p-8 text-center">
              <h3 className="text-lg font-bold text-[color:var(--fg)]">제공자 멤버십</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">서비스를 제공하려는 개인/기관/벤더</p>
              <Link href={`/${locale}/who-we-serve/providers`} className="mt-6 inline-block text-sm font-medium text-[#ce0e2d]">자세히 보기 →</Link>
            </div>
          </div>

          {/* 비교표 */}
          <h2 className="text-xl font-bold text-[color:var(--fg)]">이용자 멤버십 비교</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="py-4 text-left text-sm font-semibold text-[color:var(--fg)]">기능</th>
                  <th className="py-4 text-center text-sm font-semibold text-[#ce0e2d]">유료 멤버십</th>
                  <th className="py-4 text-center text-sm font-semibold text-[color:var(--fg)]">무료 멤버십</th>
                </tr>
              </thead>
              <tbody>
                {membershipFeatures.map((f) => (
                  <tr key={f.name} className="border-b border-[color:var(--border)]">
                    <td className="py-3 text-sm text-[color:var(--fg)]">{f.name}</td>
                    <td className="py-3 text-center text-sm">
                      {typeof f.paid === "boolean" ? (f.paid ? <span className="text-[#ce0e2d]">✓</span> : <span className="text-[color:var(--muted)]">✗</span>) : <span className="text-[color:var(--fg)]">{f.paid}</span>}
                    </td>
                    <td className="py-3 text-center text-sm">
                      {typeof f.free === "boolean" ? (f.free ? <span className="text-[#ce0e2d]">✓</span> : <span className="text-[color:var(--muted)]">✗</span>) : <span className="text-[color:var(--fg)]">{f.free}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Benefits */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">Benefits</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {membershipBenefits.map((b) => (
                <div key={b} className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ce0e2d]/10 text-sm text-[#ce0e2d]">✓</span>
                  <span className="text-sm text-[color:var(--fg)]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/onboarding/paid`} className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]">이용자 멤버십 시작</Link>
            <Link href={`/${locale}/who-we-serve/providers`} className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]">제공자 멤버십 시작</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
