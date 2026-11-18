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
            <h2 className="text-xl font-bold text-[color:var(--fg)]">홈헬스케어 서비스</h2>
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
            <p className="text-lg font-bold text-[color:var(--fg)]">BAYADA 서비스 상담</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              필요한 돌봄과 서비스 이용 방법을 문의해 주세요
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-6 inline-block text-sm font-medium text-[#ce0e2d] hover:underline"
            >
              상담 신청하기 →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
