import { prisma } from "@bayada/db";
import { kstDate } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { WebReviewManager } from "@/components/web/WebReviewManager";

export default async function WebReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const rows = await prisma.webReview.findMany({ orderBy: [{ order: "asc" }, { reviewedAt: "desc" }] });
  return (
    <>
      <PageHeader
        title="이용자 후기"
        description="홈페이지 메인 후기 캐러셀(앞 8개)과 /reviews 페이지에 보이는 후기입니다. 아카데미 수강 후기와는 별개입니다."
      />
      <WebReviewManager
        reviews={rows.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          author: r.author,
          serviceType: r.serviceType,
          reviewedAt: kstDate(r.reviewedAt),
          visible: r.visible,
          order: r.order,
        }))}
      />
    </>
  );
}
