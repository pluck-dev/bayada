import Link from "next/link";
import type { Dictionary } from "@bayada/shared/i18n";
import type { AudienceSegment } from "@/types";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

interface AudienceTemplateProps {
  segment: AudienceSegment;
  dict: Dictionary;
  locale: string;
}

export function AudienceTemplate({ segment, dict, locale }: AudienceTemplateProps) {
  return (
    <>
      <PageHero
        title={segment.nameEn}
        subtitle={segment.nameKo}
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2">
              <p className="text-lg leading-relaxed text-[color:var(--muted)]">
                {segment.description}
              </p>

              {/* 하이라이트 */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[color:var(--fg)]">
                  {segment.type === "provider" ? "파트너십 혜택" : "서비스 특징"}
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {segment.highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-xs font-bold text-[#ce0e2d]">
                        ✓
                      </span>
                      <span className="text-sm text-[color:var(--fg)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하위 세그먼트 */}
              {segment.children && segment.children.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold text-[color:var(--fg)]">세부 대상</h2>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {segment.children.map((child) => (
                      <Link
                        key={child.slug}
                        href={`/${locale}${child.href}`}
                        className="group rounded-xl border border-[color:var(--border)] p-5 transition-colors hover:border-[#ce0e2d]/30"
                      >
                        <p className="text-2xl">{child.icon}</p>
                        <h3 className="mt-2 font-semibold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                          {child.nameKo}
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">{child.nameEn}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  href={segment.ctaHref.startsWith("/") ? `/${locale}${segment.ctaHref}` : segment.ctaHref}
                  className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
                >
                  {segment.ctaLabel}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                >
                  문의하기
                </Link>
              </div>
            </div>

            {/* 사이드바 */}
            <aside className="space-y-8">
              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="font-semibold text-[color:var(--fg)]">상담 문의</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  전문 상담사가 안내해 드립니다.
                </p>
                <a
                  href="tel:1670-1379"
                  className="mt-4 block text-lg font-bold text-[#ce0e2d]"
                >
                  1670-1379
                </a>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  평일 09:00 - 18:00
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--border)] p-6">
                <h3 className="font-semibold text-[color:var(--fg)]">BAYADA Membership</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  멤버십에 가입하고 더 많은 혜택을 누리세요.
                </p>
                <Link
                  href={`/${locale}/membership`}
                  className="mt-4 inline-block text-sm font-medium text-[#ce0e2d] hover:underline"
                >
                  멤버십 알아보기 →
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
