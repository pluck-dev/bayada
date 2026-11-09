import Link from "next/link";
import { Download } from "lucide-react";
import { ProgressBar } from "@bayada/ui";
import { feedbackKinds, feedbackStatusKeys, feedbackStatuses, reviewSites, sectionLabel } from "@bayada/review/config";
import { requirePage } from "@/lib/session";
import { feedbackSummary, listFeedback, parseFeedbackFilter, siteBaseUrl, type FeedbackFilter } from "@/lib/queries/feedback";
import { Card, EmptyState, FilterChip, PageHeader, Stat, buttonClass, qs, tableWrap } from "@/components/ui";
import { Pager } from "@/components/Pager";
import { SearchBox } from "@/components/SearchBox";
import { SelectFilter } from "@/components/SelectFilter";
import { FeedbackTable } from "@/components/feedback/FeedbackTable";

const SITE_KEYS = ["web", "academy"] as const;

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  await requirePage("feedback", locale);
  const sp = await searchParams;
  const filter = parseFeedbackFilter(sp);
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const [data, summary] = await Promise.all([listFeedback(filter, page), feedbackSummary(filter.site)]);
  const base = `/${locale}/feedback`;
  const query = (patch: Partial<FeedbackFilter> & { page?: number }) => {
    const next = { ...filter, ...patch };
    return { site: next.site, status: next.status, kind: next.kind, department: next.department, section: next.site ? next.section : "", q: next.q, page: patch.page };
  };
  const detailQuery = new URLSearchParams(
    Object.entries({ ...query({}), page: page > 1 ? String(page) : "" }).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""),
  ).toString();
  const percent = summary.total ? Math.round((summary.handled / summary.total) * 100) : 0;
  const filtered = Boolean(filter.kind || filter.department || filter.section || filter.q);
  const missingUrl = SITE_KEYS.filter((s) => !siteBaseUrl(s));

  return (
    <>
      <PageHeader
        title="피드백"
        description="클라이언트가 웹사이트·아카데미의 리뷰 모드에서 화면 요소를 골라 남긴 피드백입니다. 상태를 바꾸고 댓글을 달면 사이트 리뷰 도구에도 바로 보입니다."
        actions={
          <a href={qs("/api/v1/feedback/export", query({}))} className={buttonClass("secondary")}>
            <Download className="h-4 w-4" aria-hidden />
            CSV 내려받기
          </a>
        }
      />

      {missingUrl.length > 0 && (
        <p role="status" className="mb-4 rounded-md border border-line bg-surface-sunken px-3 py-2 text-caption text-muted">
          {missingUrl.map((s) => (s === "web" ? "WEB_PUBLIC_URL" : "ACADEMY_URL")).join(", ")} 환경변수가 없어 해당 사이트의 &lsquo;위치 보기&rsquo; 링크를 만들 수 없습니다.
        </p>
      )}

      <section aria-labelledby="feedback-summary-title" className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card title={<span id="feedback-summary-title">처리 현황{filter.site ? ` · ${reviewSites[filter.site].label}` : ""}</span>}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="전체" value={summary.total} />
            <Stat label="미처리" value={summary.open} href={qs(base, { ...query({ status: "open" }), page: undefined })} />
            <Stat label="최근 7일" value={summary.recent} hint="새 피드백" />
            <Stat label="재수정 요청" value={summary.rework} hint="확인완료 전" />
          </div>
          <ProgressBar className="mt-4" value={percent} showValue label={`처리율 · ${summary.total}건 중 ${summary.handled}건 개발완료 이상`} />
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="미처리 유형별">
            {summary.kinds.map((k) => (
              <li key={k.value}>
                <FilterChip href={qs(base, query({ status: "open", kind: k.value }))} active={filter.status === "open" && filter.kind === k.value} count={k.open}>
                  미처리 · {k.label}
                </FilterChip>
              </li>
            ))}
          </ul>
          {!filter.site && (
            <p className="mt-3 text-caption text-muted">
              {summary.perSite.map((s) => `${reviewSites[s.site].label} ${s.total}건(미처리 ${s.open})`).join(" · ")}
            </p>
          )}
        </Card>
        <Card title="화면 영역별" actions={<span className="text-micro text-subtle">개발완료 이상 / 전체 · 미처리</span>}>
          {summary.sections.length === 0 ? (
            <p className="text-caption text-muted">아직 등록된 피드백이 없습니다.</p>
          ) : (
            <ol className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
              {summary.sections.map((s) => (
                <li key={`${s.site}:${s.section}`}>
                  <Link
                    href={qs(base, { site: s.site, section: s.section })}
                    className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1.5 py-1 hover:bg-surface-sunken"
                  >
                    <span className="truncate text-caption text-ink">
                      {filter.site ? "" : `${reviewSites[s.site].label} · `}
                      {sectionLabel(s.site, s.section)}
                    </span>
                    <ProgressBar size="sm" value={s.total ? (s.handled / s.total) * 100 : 0} label={`${sectionLabel(s.site, s.section)} 처리율`} />
                    <span className="tabular text-micro text-muted">
                      미처리 <strong className="text-ink">{s.open}</strong> · {s.handled}/{s.total}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>

      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="사이트">
        <FilterChip href={qs(base, query({ site: "", section: "" }))} active={!filter.site}>
          전체 사이트
        </FilterChip>
        {SITE_KEYS.map((s) => (
          <FilterChip key={s} href={qs(base, query({ site: s, section: "" }))} active={filter.site === s}>
            {reviewSites[s].label}
          </FilterChip>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="상태">
        <FilterChip href={qs(base, query({ status: "" }))} active={!filter.status} count={data.all}>
          전체
        </FilterChip>
        {feedbackStatusKeys.map((s) => (
          <FilterChip key={s} href={qs(base, query({ status: s }))} active={filter.status === s} count={data.statusCounts[s]}>
            {feedbackStatuses[s]}
          </FilterChip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBox placeholder="내용·화면 경로·작성자·#번호 검색" />
        <SelectFilter param="kind" label="유형" value={filter.kind} options={[{ value: "", label: "모든 유형" }, ...feedbackKinds]} />
        <SelectFilter
          param="department"
          label="소속"
          value={filter.department}
          options={[
            { value: "", label: "모든 소속" },
            { value: "client", label: "바야다" },
            { value: "agency", label: "제작팀" },
            { value: "none", label: "미기록" },
          ]}
        />
        {filter.site && (
          <SelectFilter param="section" label="화면 영역" value={filter.section} options={[{ value: "", label: "모든 화면 영역" }, ...reviewSites[filter.site].sections]} />
        )}
      </div>

      <div className={tableWrap}>
        {data.rows.length === 0 ? (
          <EmptyState
            title={filtered ? "조건에 맞는 피드백이 없습니다" : filter.status ? `${feedbackStatuses[filter.status]} 피드백이 없습니다` : "피드백이 없습니다"}
            description={filtered ? "검색어나 필터를 바꿔 보세요." : "사이트 /review-access 에서 리뷰 모드를 열고 피드백을 남기면 이곳에 모입니다."}
          />
        ) : (
          <FeedbackTable
            key={detailQuery}
            detailBase={base}
            detailQuery={detailQuery}
            rows={data.rows.map((r) => ({
              id: r.id,
              site: r.site,
              kind: r.kind,
              status: r.status,
              department: r.department,
              assignee: r.assignee,
              tags: r.tags,
              body: r.body,
              pagePath: r.pagePath,
              section: r.section,
              createdAt: r.createdAt.toISOString(),
              replies: r._count.replies,
              rework: Boolean(r.reworkRequestedAt) && r.status !== "resolved",
            }))}
          />
        )}
      </div>
      <Pager page={data.page} pages={data.pages} total={data.total} unit="건" />
    </>
  );
}
