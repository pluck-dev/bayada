import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { HeroSlideManager } from "@/components/web/HeroSlideManager";

export default async function WebHeroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const rows = await prisma.webHeroSlide.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageHeader
        title="메인 히어로"
        description="홈페이지 첫 화면 배경 슬라이드(5초마다 넘어감)와 제목·부제·주 버튼입니다. '바야다와 함께 일하기' 버튼은 고정입니다."
      />
      <HeroSlideManager
        slides={rows.map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl,
          alt: r.alt,
          title: r.title,
          subtitle: r.subtitle,
          ctaLabel: r.ctaLabel,
          ctaHref: r.ctaHref,
          order: r.order,
          visible: r.visible,
        }))}
      />
    </>
  );
}
