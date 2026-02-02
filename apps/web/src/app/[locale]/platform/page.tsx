import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { platforms } from "@/data/platforms";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Platform | BAYADA 홈헬스케어",
  description: "BAYADA의 4가지 디지털 플랫폼 - DeiBud, DeiCloud, DeiEdu, Dtx",
};

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="BAYADA Platform"
        subtitle="디지털 기술로 홈헬스케어의 미래를 만들어갑니다"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="space-y-8">
            {platforms.map((platform) => (
              <Link
                key={platform.slug}
                href={`/${locale}/platform/${platform.slug}`}
                className="group block rounded-2xl border border-[color:var(--border)] p-8 transition-all hover:border-[#ce0e2d]/30 hover:shadow-[var(--shadow-medium)]"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{platform.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-[color:var(--fg)] transition-colors group-hover:text-[#ce0e2d]">
                          {platform.nameEn}
                        </h3>
                        <p className="text-sm text-[color:var(--muted)]">{platform.tagline}</p>
                      </div>
                      {platform.status !== "active" && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          {platform.status === "coming-soon" ? "출시 예정" : "파트너십"}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                      {platform.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {platform.features.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--muted)]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#ce0e2d]">
                    {platform.ctaLabel} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
