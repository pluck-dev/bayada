import Link from "next/link";
import type { Dictionary } from "@bayada/shared/i18n";
import type { PlatformProduct } from "@/types";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

interface PlatformDetailTemplateProps {
  platform: PlatformProduct;
  dict: Dictionary;
  locale: string;
}

export function PlatformDetailTemplate({ platform, dict, locale }: PlatformDetailTemplateProps) {
  return (
    <>
      <PageHero
        title={platform.nameEn}
        subtitle={platform.tagline}
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* 상태 뱃지 */}
            {platform.status !== "active" && (
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {platform.status === "coming-soon" ? "출시 예정" : "파트너십 내 서비스"}
              </div>
            )}

            {/* 설명 */}
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">{platform.nameKo}</h2>
            <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted)]">
              {platform.description}
            </p>

            {/* 기능 */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-[color:var(--fg)]">주요 기능</h3>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {platform.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ce0e2d]/10 text-sm text-[#ce0e2d]">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-[color:var(--fg)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href={platform.ctaHref.startsWith("/") ? `/${locale}${platform.ctaHref}` : platform.ctaHref}
                className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
              >
                {platform.ctaLabel}
              </Link>
              <Link
                href={`/${locale}/platform`}
                className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
              >
                모든 플랫폼 보기
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
