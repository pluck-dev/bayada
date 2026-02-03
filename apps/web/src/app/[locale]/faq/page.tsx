import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { faqCategories } from "@/data/faq-data";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { FAQAccordion } from "@/components/FAQAccordion";

export const metadata = createMetadata({
  title: "자주 묻는 질문",
  description:
    "바야다홈헬스케어 자주 묻는 질문 - 서비스 이용, 비용, 장기요양보험, 멤버십 등 궁금한 점을 확인하세요.",
  path: "/ko/faq",
});

export default async function FAQPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category: selectedCategory } = await searchParams;
  const dict = await getDictionary(locale as Locale);

  /* 선택된 카테고리가 없으면 전체 표시 */
  const activeCategory = selectedCategory || "all";
  const filteredCategories =
    activeCategory === "all"
      ? faqCategories
      : faqCategories.filter((c) => c.slug === activeCategory);

  /* 전체 FAQ 아이템 (검색용 표시) */
  const totalItems = faqCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0,
  );

  return (
    <>
      <PageHero title={dict.web.faq.title} subtitle="궁금한 점을 찾아보세요" />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          {/* 검색 안내 */}
          <div className="mb-8">
            <div className="rounded-xl bg-[color:var(--surface)] p-4">
              <p className="text-center text-sm text-[color:var(--muted)]">
                총 <span className="font-semibold text-[color:var(--fg)]">{totalItems}</span>개의 자주 묻는 질문이 있습니다
              </p>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={`/${locale}/faq`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-[#ce0e2d] text-white"
                  : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[#ce0e2d]/30"
              }`}
            >
              전체
            </Link>
            {faqCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/faq?category=${cat.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-[#ce0e2d] text-white"
                    : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[#ce0e2d]/30"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* FAQ 아코디언 (카테고리별) */}
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <div key={cat.slug}>
                {activeCategory === "all" && (
                  <h2 className="mb-4 text-lg font-bold text-[color:var(--fg)]">
                    {cat.name}
                  </h2>
                )}
                <FAQAccordion items={cat.items} />
              </div>
            ))}
          </div>

          {/* 추가 문의 안내 */}
          <div className="mt-12 rounded-2xl bg-[color:var(--surface)] p-8 text-center">
            <h3 className="text-lg font-bold text-[color:var(--fg)]">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              전문 상담원이 친절하게 답변드립니다
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="rounded-full bg-[#ce0e2d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#b00c27]"
              >
                문의하기
              </Link>
              <span className="text-sm text-[color:var(--muted)]">
                또는 1670-1379로 전화하세요
              </span>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
