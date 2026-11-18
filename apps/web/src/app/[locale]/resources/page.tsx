import { getWebPageContent } from "@/lib/web-pages";
import { resourceLinkAvailable } from "@/lib/resource-links";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "Resources",
  description: "바야다홈헬스케어 리소스 센터. 가이드, 문서, 교육 자료를 확인하세요.",
  path: "/ko/resources",
});

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { items } = await getWebPageContent("resources");
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="Resources"
        subtitle="바야다홈헬스케어 가이드 및 자료 모음"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <NeedsReview
            label="수정필요"
            note="엑셀 시트: Resources (rows: 2, cols: 2) — 내용이 [B2] Resources 텍스트만 있음. bayada.com/resources 참고하여 실제 자료 목록 및 카테고리 채워야 함."
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <a
                  key={item.title}
                  href={resourceLinkAvailable(item.href) ? item.href : undefined}
                  aria-disabled={!resourceLinkAvailable(item.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-2xl border border-[color:var(--border)] p-6 transition hover:border-[#ce0e2d]/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--muted)]">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-[#ce0e2d]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ce0e2d]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[color:var(--fg)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--muted)]">
                    {item.desc}
                  </p>
                  <span className="mt-4 text-sm font-medium text-[#ce0e2d]">
                    {resourceLinkAvailable(item.href) ? "자료 보기 →" : "자료 준비 중"}
                  </span>
                </a>
              ))}
            </div>
          </NeedsReview>
        </Container>
      </section>
    </>
  );
}
