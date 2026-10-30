import Link from "next/link";
import { Star } from "lucide-react";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { listReviews, maskName, type ReviewFilter } from "@/lib/queries/reviews";
import { formatDate } from "@/lib/labels";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { Pager } from "@/components/Pager";
import { ReviewActions } from "@/components/reviews/ReviewActions";

function excerpt(text: string, n = 70): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("review", locale);
  const sp = await searchParams;
  const filter: ReviewFilter = sp.filter === "reported" || sp.filter === "hidden" ? sp.filter : undefined;
  const data = await listReviews(filter, Math.max(1, Number(sp.page) || 1));
  const base = `/${locale}/reviews`;

  return (
    <>
      <PageHeader
        title="후기 관리"
        description="학습자 후기와 신고를 검토합니다. 신고가 많은 후기가 위에 옵니다. 작성자 이름은 가려서 표시합니다."
      />

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="후기 필터">
        <FilterChip href={base} active={!filter} count={data.counts.all}>
          전체
        </FilterChip>
        <FilterChip href={qs(base, { filter: "reported" })} active={filter === "reported"} count={data.counts.reported}>
          미처리 신고
        </FilterChip>
        <FilterChip href={qs(base, { filter: "hidden" })} active={filter === "hidden"} count={data.counts.hidden}>
          숨김
        </FilterChip>
      </div>

      <div className={tableWrap}>
        {data.rows.length === 0 ? (
          <EmptyState
            title={filter === "reported" ? "처리할 신고가 없습니다" : filter === "hidden" ? "숨긴 후기가 없습니다" : "아직 작성된 후기가 없습니다"}
            description={filter ? undefined : "진도 80% 이상이거나 수료한 학습자가 후기를 남기면 여기에 쌓입니다."}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>프로그램</th>
                <th className={thClass}>평점</th>
                <th className={thClass}>내용</th>
                <th className={thClass}>작성자</th>
                <th className={cx(thClass, "text-right")}>신고</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>작성일</th>
                <th className={cx(thClass, "w-px")} aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id} className={cx(trClass, r.status === "PUBLISHED" && r.reportCount > 0 && "bg-danger-soft")}>
                  <td className={cx(tdClass, "max-w-[220px] truncate")}>
                    {can(user, "program.read") ? (
                      <Link href={`/${locale}/programs/${r.course.id}`} className="hover:underline" title={r.course.title}>
                        {r.course.title}
                      </Link>
                    ) : (
                      r.course.title
                    )}
                  </td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center gap-0.5" aria-label={`5점 중 ${r.rating}점`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cx("h-3 w-3", i <= r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300")}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </td>
                  <td className={cx(tdClass, "max-w-[380px] whitespace-normal! text-ink-soft")} title={r.content}>
                    {excerpt(r.content)}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{maskName(r.user.name, r.user.email)}</td>
                  <td className={cx(tdClass, "tabular text-right", r.reportCount > 0 ? "font-semibold text-danger" : "text-zinc-400")}>
                    {r.reportCount}
                  </td>
                  <td className={tdClass}>
                    {r.status === "HIDDEN" ? (
                      <Badge tone="slate" dot>
                        숨김
                      </Badge>
                    ) : r.reportCount > 0 ? (
                      <Badge tone="red" dot>
                        신고 검토 필요
                      </Badge>
                    ) : (
                      <Badge tone="green" dot>
                        게시
                      </Badge>
                    )}
                  </td>
                  <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(r.createdAt)}</td>
                  <td className={cx(tdClass, "text-right")}>
                    <ReviewActions id={r.id} status={r.status} reportCount={r.reportCount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={data.page} pages={data.pages} total={data.total} unit="개 후기" />
    </>
  );
}
