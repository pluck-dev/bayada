import Link from "next/link";
import { Globe2 } from "lucide-react";
import { Badge, CourseCard } from "@bayada/ui";
import { JOB_ROLE_LABEL } from "@/lib/labels";
import type { PathwayCardData } from "@/lib/queries/pathways";

/** 국가 카드 (홈 ⑤ · 패스웨이 목록). 카드 모양은 프로그램 카드와 같다. 표지 이미지가 없으면 국가명을 크게 */
export function PathwayCard({ pathway, locale }: { pathway: PathwayCardData; locale: string }) {
  return (
    <CourseCard
      LinkComponent={Link}
      href={`/${locale}/pathways/${encodeURIComponent(pathway.slug)}`}
      title={pathway.title}
      typeLabel="커리어 패스웨이"
      provider={pathway.country}
      meta={[pathway.jobRole ? JOB_ROLE_LABEL[pathway.jobRole] : null, `${pathway._count.steps}단계`, pathway.summary]}
      badge={<Badge tone="neutral" className="bg-canvas/90">{pathway.country}</Badge>}
      media={
        pathway.coverImage ? (
          // 표지 이미지는 어드민이 입력한 원격 URL
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pathway.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-neutral-100 to-neutral-50 p-5 text-ink">
            <Globe2 className="h-6 w-6 self-end text-subtle" aria-hidden />
            <span className="text-h2 text-ink-soft">{pathway.country}</span>
          </span>
        )
      }
    />
  );
}
