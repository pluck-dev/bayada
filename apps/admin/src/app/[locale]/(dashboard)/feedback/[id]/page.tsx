import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { departmentLabel, feedbackKindLabel, feedbackStatuses, reviewSites, sectionLabel, type FeedbackStatus } from "@bayada/review/config";
import { requirePage } from "@/lib/session";
import { feedbackContext, feedbackLocationUrl, getFeedback } from "@/lib/queries/feedback";
import { FEEDBACK_KIND_TONE, FEEDBACK_STATUS_TONE } from "@/lib/feedback-labels";
import { formatDateTime } from "@/lib/labels";
import { Badge, Card, Disclosure, PageHeader, buttonClass } from "@/components/ui";
import { FeedbackStatusSelect } from "@/components/feedback/FeedbackStatusSelect";
import { FeedbackReplyForm } from "@/components/feedback/FeedbackReplyForm";
import { FeedbackReworkForm } from "@/components/feedback/FeedbackReworkForm";

const BACK_KEYS = ["site", "status", "kind", "department", "section", "q", "page"] as const;

const TECH_FIELDS: [string, string][] = [
  ["선택자", "selector"],
  ["태그", "tag"],
  ["컴포넌트", "component"],
  ["타이포", "typography"],
  ["폰트", "font"],
  ["색상", "color"],
  ["클래스", "classes"],
];

export default async function FeedbackDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, id } = await params;
  await requirePage("feedback", locale);
  if (!/^\d{1,9}$/.test(id)) notFound();
  const row = await getFeedback(Number(id));
  if (!row) notFound();

  const sp = await searchParams;
  const back = new URLSearchParams();
  for (const key of BACK_KEYS) {
    const v = sp[key];
    const value = Array.isArray(v) ? v[0] : v;
    if (value) back.set(key, value);
  }
  const backHref = `/${locale}/feedback${back.size ? `?${back}` : ""}`;
  const context = feedbackContext(row.context);
  const locationUrl = feedbackLocationUrl(row.site, row.pagePath, context, row.id);
  const status = row.status as FeedbackStatus;
  const roots = row.replies.filter((r) => r.parentId === null);
  const replyAuthor = (r: { authorName: string; department: string | null }) =>
    `${r.authorName}${departmentLabel(r.department) ? ` · ${departmentLabel(r.department)}` : ""}`;

  return (
    <>
      <PageHeader
        back={{ href: backHref, label: "피드백 목록" }}
        title={`피드백 #${row.id}`}
        description="본문과 대상 화면을 확인한 뒤 상태를 바꿉니다. 댓글은 사이트 리뷰 도구의 같은 카드에 표시됩니다."
        actions={<FeedbackStatusSelect id={row.id} status={status} />}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="slate">{reviewSites[row.site].label}</Badge>
                <Badge tone={FEEDBACK_KIND_TONE[row.kind] ?? "zinc"}>{feedbackKindLabel(row.kind)}</Badge>
                <Badge tone={FEEDBACK_STATUS_TONE[row.status] ?? "zinc"} dot>
                  {feedbackStatuses[status]}
                </Badge>
              </div>
              <time className="tabular text-caption text-subtle" dateTime={row.createdAt.toISOString()}>
                {formatDateTime(row.createdAt)}
              </time>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-body text-ink">{row.body}</p>
            {row.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-caption text-muted" aria-label="태그">
                {row.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            )}
            {row.reworkReason && (
              <section className="mt-4 rounded-md bg-warning-soft px-3 py-2.5">
                <h2 className="text-caption font-semibold text-ink">
                  최근 재수정 요청{row.reworkRequestedAt ? ` · ${formatDateTime(row.reworkRequestedAt)}` : ""}
                </h2>
                <p className="mt-1 whitespace-pre-wrap text-caption text-ink">{row.reworkReason}</p>
              </section>
            )}
            {context.text && (
              <section className="mt-4">
                <h2 className="text-caption font-semibold text-muted">선택한 요소의 텍스트</h2>
                <blockquote className="mt-1 border-l-2 border-line-strong pl-3 text-caption text-ink">{String(context.text)}</blockquote>
              </section>
            )}
            <Disclosure className="mt-4 text-caption" summary="요소·스타일 정보">
              <dl className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1">
                {TECH_FIELDS.map(([label, key]) => (
                  <div key={key} className="contents">
                    <dt className="text-subtle">{label}</dt>
                    <dd className="break-all text-ink">{context[key] ? String(context[key]) : "미기록"}</dd>
                  </div>
                ))}
              </dl>
            </Disclosure>
          </Card>

          <Card tour="feedback-comments" title={`댓글 ${row.replies.length}`}>
            {roots.length === 0 && <p className="text-caption text-muted">아직 댓글이 없습니다.</p>}
            <ol className="grid gap-3">
              {roots.map((r) => (
                <li key={r.id} className="border-b border-line pb-3 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-caption">
                    <strong className="text-ink">{replyAuthor(r)}</strong>
                    <time className="tabular text-subtle">{formatDateTime(r.createdAt)}</time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-caption text-ink">{r.body}</p>
                  {row.replies
                    .filter((c) => c.parentId === r.id)
                    .map((c) => (
                      <div key={c.id} className="ml-4 mt-2 rounded-md bg-surface-sunken px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-caption">
                          <strong className="text-ink">{replyAuthor(c)}</strong>
                          <time className="tabular text-subtle">{formatDateTime(c.createdAt)}</time>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-caption text-ink">{c.body}</p>
                      </div>
                    ))}
                  <FeedbackReplyForm feedbackId={row.id} parentId={r.id} compact />
                </li>
              ))}
            </ol>
            <div className="mt-3 border-t border-line pt-3">
              <FeedbackReplyForm feedbackId={row.id} />
            </div>
          </Card>
        </div>

        <aside data-tour="feedback-aside" className="grid content-start gap-4">
          <Card title="작성 정보">
            <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-y-1.5 text-caption">
              <dt className="text-subtle">작성자</dt>
              <dd className="text-ink">{row.assignee || "미기록"}</dd>
              <dt className="text-subtle">소속</dt>
              <dd className="text-ink">{departmentLabel(row.department) || "미기록"}</dd>
              <dt className="text-subtle">작성일</dt>
              <dd className="tabular text-ink">{formatDateTime(row.createdAt)}</dd>
              <dt className="text-subtle">수정</dt>
              <dd className="text-ink">{row.editVersion ? `${row.editVersion}회 · ${formatDateTime(row.updatedAt)}` : "없음"}</dd>
            </dl>
          </Card>
          <Card title="대상 화면">
            <p className="text-caption font-medium text-ink">
              {reviewSites[row.site].label} · {sectionLabel(row.site, row.section)}
            </p>
            <p className="mt-1 break-all text-caption text-muted">{row.pagePath}</p>
            <p className="mt-1 text-micro text-subtle">
              저장 당시 화면 {context.width && context.height ? `${context.width} × ${context.height}px` : "크기 미기록"}
            </p>
            {locationUrl ? (
              <a href={locationUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass("secondary")} mt-3 w-full`}>
                위치 보기
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : (
              <p className="mt-3 text-micro text-subtle">{row.site === "web" ? "WEB_PUBLIC_URL" : "ACADEMY_URL"} 환경변수가 없어 위치 보기 링크를 만들 수 없습니다.</p>
            )}
            <p className="mt-2 text-micro text-subtle">리뷰 모드가 켜진 브라우저에서 열면 해당 요소로 스크롤해 강조합니다.</p>
          </Card>
          {(status === "deployed" || status === "resolved") && (
            <Card title="수동 처리">
              <p className="text-caption text-muted">관리자가 상태를 직접 변경했습니다. 자동 배포 검증 기록은 없습니다.</p>
            </Card>
          )}
          {status !== "open" && status !== "discussion" && (
            <Card title="재수정 요청">
              <FeedbackReworkForm id={row.id} />
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
