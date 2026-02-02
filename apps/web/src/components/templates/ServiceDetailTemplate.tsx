import Link from "next/link";
import type { Dictionary } from "@bayada/shared/i18n";
import type { ServiceData } from "@/types";
import { getRelatedServices } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

interface ServiceDetailTemplateProps {
  service: ServiceData;
  dict: Dictionary;
  locale: string;
}

export function ServiceDetailTemplate({ service, dict, locale }: ServiceDetailTemplateProps) {
  const related = getRelatedServices(service.slug);

  return (
    <>
      <PageHero
        title={service.nameEn}
        subtitle={service.nameKo}
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2">
              {/* 서비스 설명 */}
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-[color:var(--muted)]">
                  {service.description}
                </p>
              </div>

              {/* 하이라이트 */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[color:var(--fg)]">주요 특징</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {service.highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-xs font-bold text-[#ce0e2d]">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[color:var(--fg)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하위 서비스 (노인장기요양 등) */}
              {service.subServices && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold text-[color:var(--fg)]">세부 서비스</h2>
                  <div className="mt-6 space-y-4">
                    {service.subServices.map((sub, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-[color:var(--surface)] p-5"
                      >
                        <h3 className="font-semibold text-[color:var(--fg)]">{sub.name}</h3>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">{sub.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 서비스 절차 */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[color:var(--fg)]">이용 절차</h2>
                <div className="mt-6 space-y-6">
                  {service.process.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[color:var(--fg)]">{step.title}</h3>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 대상 */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[color:var(--fg)]">이용 대상</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.targetAudience.map((target) => (
                    <span
                      key={target}
                      className="rounded-full bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--fg)]"
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  href={`/${locale}/contact?service=${service.slug}`}
                  className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
                >
                  상담 신청하기
                </Link>
                <Link
                  href={`/${locale}/what-we-do`}
                  className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                >
                  모든 서비스 보기
                </Link>
              </div>
            </div>

            {/* 사이드바 */}
            <aside className="space-y-8">
              {/* 관련 서비스 */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-[color:var(--border)] p-6">
                  <h3 className="font-semibold text-[color:var(--fg)]">관련 서비스</h3>
                  <div className="mt-4 space-y-3">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/${locale}/what-we-do/${r.slug}`}
                        className="block rounded-lg p-3 transition-colors hover:bg-[color:var(--surface)]"
                      >
                        <p className="text-sm font-medium text-[color:var(--fg)]">{r.nameEn}</p>
                        <p className="text-xs text-[color:var(--muted)]">{r.nameKo}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 상담 안내 */}
              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="font-semibold text-[color:var(--fg)]">상담 문의</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  전문 상담사가 맞춤 서비스를 안내해 드립니다.
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
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
