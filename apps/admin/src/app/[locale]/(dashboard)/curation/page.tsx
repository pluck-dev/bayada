import { requirePage } from "@/lib/session";
import { getCuration } from "@/lib/queries/admin";
import { PageHeader } from "@/components/ui";
import { BannerManager } from "@/components/curation/BannerManager";
import { FeaturedManager } from "@/components/curation/FeaturedManager";

export default async function CurationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("curation", locale);
  const { banners, featured, candidates } = await getCuration();

  return (
    <>
      <PageHeader
        title="배너 · 메인 큐레이션"
        description="히어로 배너는 노출 기간이 필수이며 종료일이 지나면 자동으로 내려갑니다. 메인 신규·인기 영역은 게시된 프로그램 중에서 고릅니다."
      />
      <div className="flex flex-col gap-6">
        <BannerManager
          now={new Date().toISOString()}
          banners={banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image: b.image,
            linkUrl: b.linkUrl,
            order: b.order,
            startsAt: b.startsAt.toISOString(),
            endsAt: b.endsAt.toISOString(),
          }))}
        />
        <FeaturedManager locale={locale} featured={featured} candidates={candidates} />
      </div>
    </>
  );
}
