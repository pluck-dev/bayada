import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { JOB_ROLE_LABEL } from "@/lib/labels";
import type { PathwayCardData } from "@/lib/queries/pathways";

/** 국가 카드 (홈 ⑤ · 패스웨이 목록). 표지 이미지가 없으면 국가명을 크게 보여 준다 */
export function PathwayCard({ pathway, locale }: { pathway: PathwayCardData; locale: string }) {
  const meta = [pathway.jobRole ? JOB_ROLE_LABEL[pathway.jobRole] : null, `${pathway._count.steps}단계`]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/${locale}/pathways/${encodeURIComponent(pathway.slug)}`}
      className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white"
    >
      <span className="relative block aspect-[16/9] overflow-hidden bg-line-soft">
        {pathway.coverImage ? (
          // 표지 이미지는 어드민이 입력한 원격 URL
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pathway.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-zinc-100 via-zinc-50 to-white p-5 text-ink">
            <Globe2 className="h-6 w-6 self-end text-brand" aria-hidden />
            <span className="text-[26px] font-bold tracking-tight">{pathway.country}</span>
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-card ring-1 ring-black/5 backdrop-blur">
          {pathway.country}
        </span>
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-start justify-between gap-3">
          <span className="line-clamp-2 text-[16px] font-bold leading-snug text-ink group-hover:text-brand">{pathway.title}</span>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-subtle group-hover:text-brand" aria-hidden />
        </span>
        {pathway.summary && <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{pathway.summary}</span>}
        <span className="mt-auto pt-4 text-xs font-medium text-ink-soft">{meta}</span>
      </span>
    </Link>
  );
}
