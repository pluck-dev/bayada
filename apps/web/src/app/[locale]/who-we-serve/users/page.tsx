import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { userSegments } from "@/data/audiences";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata = createMetadata({
  title: "서비스 이용자",
  description:
    "나에게 맞는 홈헬스케어 서비스를 찾아보세요. 시니어, 만성질환 환자, 장애인을 위한 맞춤 서비스를 제공합니다.",
  path: "/ko/who-we-serve/users",
});

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="Who We Serve — Users"
        subtitle="나에게 맞는 홈헬스케어 서비스를 찾아보세요"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 멤버십 선택 */}
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#ce0e2d]/20 bg-[#ce0e2d]/5 p-8">
              <h3 className="text-lg font-bold text-[color:var(--fg)]">유료 멤버십</h3>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                <li>• 라이프스타일 설문</li>
                <li>• 건강검진 분석</li>
                <li>• 맞춤 서비스 제안</li>
                <li>• 견적 확인</li>
                <li>• DeiBud AI 맞춤 상담</li>
              </ul>
              <Link
                href={`/${locale}/onboarding/paid`}
                className="mt-6 inline-block rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
              >
                시작하기
              </Link>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] p-8">
              <h3 className="text-lg font-bold text-[color:var(--fg)]">무료 멤버십</h3>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                <li>• 기본 정보 입력</li>
                <li>• AI 기본 상담</li>
                <li>• 서비스 안내</li>
                <li>• 상담 신청</li>
              </ul>
              <Link
                href={`/${locale}/onboarding/free`}
                className="mt-6 inline-block rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
              >
                무료로 시작
              </Link>
            </div>
          </div>

          {/* 대상 세그먼트 */}
          <h2 className="text-xl font-bold text-[color:var(--fg)]">서비스 이용자 대상</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {userSegments.map((seg) => (
              <Link
                key={seg.slug}
                href={`/${locale}${seg.href}`}
                className="group rounded-2xl border border-[color:var(--border)] p-6 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
              >
                <span className="text-3xl">{seg.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                  {seg.nameKo}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{seg.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-[#ce0e2d]">
                  {seg.ctaLabel} →
                </span>
              </Link>
            ))}
          </div>

          {/* 12가지 서비스 미리보기 */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">12가지 홈헬스케어 서비스</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/${locale}/what-we-do/${service.slug}`}
                  className="rounded-xl border border-[color:var(--border)] p-4 text-center transition-colors hover:border-[#ce0e2d]/30"
                >
                  <span className="text-2xl">{service.icon}</span>
                  <p className="mt-2 text-xs font-medium text-[color:var(--fg)]">{service.nameKo}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* 하단 CTA */}
          <div className="mt-16 rounded-2xl bg-[color:var(--surface)] p-8 text-center">
            <p className="text-lg font-bold text-[color:var(--fg)]">BAYADA Membership</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              멤버십에 가입하고 맞춤 케어를 시작하세요
            </p>
            <Link
              href={`/${locale}/membership`}
              className="mt-6 inline-block text-sm font-medium text-[#ce0e2d] hover:underline"
            >
              멤버십 자세히 보기 →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
