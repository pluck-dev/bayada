import Link from "next/link";
import { WEB_INQUIRY_STATUS_LABEL, webFormLabel } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getWebDashboard } from "@/lib/queries/web";
import { getBookingDashboard } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { INQUIRY_STATUS_TONE } from "@/lib/web-labels";
import { Badge, Card, EmptyState, PageHeader, Stat, qs } from "@/components/ui";

export default async function WebDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage(["web.inquiries", "web.content", "web.bookings", "web.members"], locale);
  const bookingsOn = can(user, "web.bookings");
  const membersOn = can(user, "web.members");
  const [d, bk] = await Promise.all([getWebDashboard(), bookingsOn || membersOn ? getBookingDashboard() : null]);
  const base = `/${locale}/web`;
  const crm = can(user, "web.inquiries");
  const content = can(user, "web.content");

  return (
    <>
      <PageHeader title="웹사이트" description="홈페이지(bayada 기업 사이트) 문의·서비스 예약·회원·콘텐츠 현황입니다. 모든 숫자는 실제 데이터 기준입니다." />

      {crm && (
        <div data-tour="web-kpi" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat tone="brand" label="신규 문의" value={d.status.NEW ?? 0} hint="아직 처리 전" href={qs(`${base}/inquiries`, { status: "NEW" })} />
          <Stat tone="ink" label="진행 중" value={(d.status.CONTACTED ?? 0) + (d.status.IN_PROGRESS ?? 0)} hint="연락 완료 · 진행 중" href={`${base}/inquiries`} />
          <Stat label="최근 7일 접수" value={d.week} hint="스팸 제외" />
          <Stat label="처리 완료" value={d.status.DONE ?? 0} hint="누적" href={qs(`${base}/inquiries`, { status: "DONE" })} />
        </div>
      )}

      {bk && (bookingsOn || membersOn) && (
        <div data-tour="web-bookings-kpi" className={`${crm ? "mt-3" : ""} grid grid-cols-2 gap-3 lg:grid-cols-4`}>
          {bookingsOn && (
            <>
              <Stat tone={bk.requested ? "brand" : "paper"} label="예약 신청 대기" value={bk.requested} hint="확정·담당자 배정 전" href={qs(`${base}/bookings`, { status: "REQUESTED" })} />
              <Stat label="다가오는 확정 예약" value={bk.upcoming} hint={`오늘 방문 ${bk.today}건`} href={qs(`${base}/bookings`, { status: "CONFIRMED" })} />
              <Stat label="긴급 상태 방문" value={bk.urgent} hint="최근 7일 방문 기록" href={qs(`${base}/visits`, { condition: "URGENT" })} />
            </>
          )}
          {membersOn && <Stat label="홈페이지 회원" value={bk.members} hint={bk.withdrawals ? `탈퇴 요청 ${bk.withdrawals}건` : bk.avgRating ? `평균 만족도 ${bk.avgRating.toFixed(1)}` : "이용 중"} href={`${base}/members`} />}
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
              <EmptyState title="아직 접수된 문의가 없습니다" description="홈페이지 상담 신청·자격 신청·사전 신청이 여기에 쌓입니다." />
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
              항목이 하나도 없으면 홈페이지는 기존 기본 콘텐츠를 보여 줍니다. 지우기보다 숨김을 쓰세요.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
