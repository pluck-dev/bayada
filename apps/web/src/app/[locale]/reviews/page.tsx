import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { reviews, getAverageRating } from "@/data/reviews";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "이용자 후기 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 이용자 후기",
};

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const avg = getAverageRating();

  return (
    <>
      <PageHero title="Reviews" subtitle="이용자 후기" />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="mb-8 rounded-2xl bg-[color:var(--surface)] p-6 text-center">
            <p className="text-4xl font-bold text-[#ce0e2d]">★ {avg}</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">총 {reviews.length}개 후기</p>
          </div>
          <div className="space-y-6">
            {reviews.map((review) => {
              const service = services.find((s) => s.slug === review.serviceType);
              return (
                <div key={review.id} className="rounded-2xl border border-[color:var(--border)] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#ce0e2d]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      {service && <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--muted)]">{service.nameKo}</span>}
                    </div>
                    <span className="text-xs text-[color:var(--muted)]">{review.createdAt}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--fg)]">{review.content}</p>
                  <p className="mt-3 text-xs text-[color:var(--muted)]">— {review.author}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
