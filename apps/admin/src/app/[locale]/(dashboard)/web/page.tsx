import Link from "next/link";
import { WEB_INQUIRY_STATUS_LABEL, webFormLabel } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getWebDashboard } from "@/lib/queries/web";
import { formatDateTime } from "@/lib/labels";
import { INQUIRY_STATUS_TONE } from "@/lib/web-labels";
import { Badge, Card, EmptyState, PageHeader, Stat, qs } from "@/components/ui";

export default async function WebDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage(["web.inquiries", "web.content", "web.settings"], locale);
  const d = await getWebDashboard();
  const base = `/${locale}/web`;
  const crm = can(user, "web.inquiries");
  const content = can(user, "web.content");

  return (
    <>
      <PageHeader title="웹사이트" description="홈페이지(bayada 기업 사이트) 문의·콘텐츠 현황입니다. 모든 숫자는 실제 데이터 기준입니다." />

      {crm && (
        <div data-tour="web-kpi" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat tone="brand" label="신규 문의" value={d.status.NEW ?? 0} hint="아직 처리 전" href={qs(`${base}/inquiries`, { status: "NEW" })} />
          <Stat tone="ink" label="진행 중" value={(d.status.CONTACTED ?? 0) + (d.status.IN_PROGRESS ?? 0)} hint="연락 완료 · 진행 중" href={`${base}/inquiries`} />
          <Stat label="최근 7일 접수" value={d.week} hint="스팸 제외" />
          <Stat label="처리 완료" value={d.status.DONE ?? 0} hint="누적" href={qs(`${base}/inquiries`, { status: "DONE" })} />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {crm && (
          <Card
            tour="web-recent"
            title="최근 문의"
            padded={false}
            actions={
              <Link href={`${base}/inquiries`} className="text-caption text-muted hover:text-ink">
                전체 보기
              </Link>
            }
          >
            {d.recent.length === 0 ? (
              <EmptyState title="아직 접수된 문의가 없습니다" description="홈페이지에서 접수한 상담·지원·일반 문의를 확인합니다." />
            ) : (
              <ul className="divide-y divide-hairline">
                {d.recent.map((r) => (
                  <li key={r.id}>
                    <Link href={`${base}/inquiries/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 text-caption hover:bg-surface">
                      <Badge tone={INQUIRY_STATUS_TONE[r.status]} dot>
                        {WEB_INQUIRY_STATUS_LABEL[r.status]}
                      </Badge>
                      <span className="flex-1 truncate">
                        <span className="font-medium">{r.name ?? r.organization ?? "(이름 없음)"}</span>
                        <span className="ml-2 text-subtle">{webFormLabel(r.formType)}</span>
                      </span>
                      <span className="tabular shrink-0 text-subtle">{formatDateTime(r.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {content && (
          <Card tour="web-content" title="홈페이지 콘텐츠">
            <ul className="flex flex-col gap-2 text-caption">
              {[
                { href: `${base}/blog`, label: "블로그", value: `게시 ${d.content.posts} · 초안 ${d.content.drafts}` },
                { href: `${base}/faq`, label: "자주 묻는 질문", value: `공개 ${d.content.faqs}개` },
                { href: `${base}/reviews`, label: "이용자 후기", value: `공개 ${d.content.reviews}개` },
                { href: `${base}/hero`, label: "메인 히어로", value: `노출 ${d.content.slides}장` },
              ].map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-surface">
                    <span className="font-medium">{c.label}</span>
                    <span className="tabular text-muted">{c.value}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-caption text-muted">
              저장한 공개 상태가 홈페이지에 반영됩니다. 모두 숨기거나 삭제하면 해당 콘텐츠가 표시되지 않습니다.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
