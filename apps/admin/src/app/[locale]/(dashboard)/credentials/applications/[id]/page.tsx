import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getApplication } from "@/lib/queries/credentials";
import { CREDENTIAL_APP_STATUS_LABEL, CREDENTIAL_APP_STATUS_TONE, judge, validityLabel } from "@/lib/credentials";
import { AUDIT_ACTION_LABEL, JOB_ROLE_LABEL, formatDate, formatDateTime } from "@/lib/labels";
import { Badge, Card, PageHeader, cx } from "@/components/ui";
import { DecisionPanel, EvaluationPanel } from "@/components/credentials/ApplicationPanels";

export default async function CredentialApplicationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("credential.read", locale);
  const data = await getApplication(id);
  if (!data) notFound();
  const { app, prerequisites, credentials, history } = data;
  const p = app.program;
  const prerequisitesDone = prerequisites.every((r) => !!r.completedAt);
  const passed = judge(p, app.examScore, app.practicalScore);
  const issued = app.status === "APPROVED" ? credentials.find((c) => app.decidedAt && c.issuedAt.getTime() === app.decidedAt.getTime()) : undefined;
  const now = new Date();

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/credentials`, label: "심사 큐" }}
        title={`${app.user.name ?? app.user.email} · ${p.title}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={CREDENTIAL_APP_STATUS_TONE[app.status]} dot>
              {CREDENTIAL_APP_STATUS_LABEL[app.status]}
            </Badge>
            <span>{formatDateTime(app.createdAt)} 신청</span>
          </span>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="응시자">
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2.5 text-[13px]">
              <dt className="text-muted">이름</dt>
              <dd className="font-medium">
                {can(user.role, "member.read") ? (
                  <Link href={`/${locale}/members/${app.user.id}`} className="hover:underline">
                    {app.user.name ?? "-"}
                  </Link>
                ) : (
                  (app.user.name ?? "-")
                )}
              </dd>
              <dt className="text-muted">이메일</dt>
              <dd>{app.user.email}</dd>
              <dt className="text-muted">연락처</dt>
              <dd className="tabular">{app.user.phone ?? "-"}</dd>
              <dt className="text-muted">직군 · 소속</dt>
              <dd>{[app.user.jobRole ? JOB_ROLE_LABEL[app.user.jobRole] : null, app.user.organization?.name].filter(Boolean).join(" · ") || "-"}</dd>
            </dl>
          </Card>

          <Card
            title="선수 프로그램 이수 확인"
            actions={
              <Badge tone={prerequisitesDone ? "green" : "red"}>
                {prerequisites.filter((r) => r.completedAt).length} / {prerequisites.length} 수료
              </Badge>
            }
            padded={false}
          >
            <ul className="divide-y divide-zinc-100">
              {prerequisites.map((r) => (
                <li key={r.courseId} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  {r.completedAt ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="수료" />
                  ) : (
                    <CircleDashed className="h-4 w-4 shrink-0 text-zinc-400" aria-label="미수료" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{r.title}</span>
                  <span className={cx("tabular shrink-0 text-[12px]", r.completedAt ? "text-emerald-700" : "text-muted")}>
                    {r.completedAt ? `${formatDate(r.completedAt)} 수료` : r.enrolled ? `진도 ${r.progressPercent}%` : "수강 기록 없음"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-4 py-2 text-[11.5px] text-muted">수강 기록(수료일)에서 지금 다시 계산한 값입니다.</p>
          </Card>

          <Card title="신청 동기">
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-700">{app.motivation || "작성하지 않았습니다."}</p>
          </Card>

          {credentials.length > 0 && (
            <Card title="이 과정의 발급 이력" padded={false}>
              <ul className="divide-y divide-zinc-100">
                {credentials.map((c) => {
                  const state = c.revokedAt ? "취소" : c.expiresAt && c.expiresAt <= now ? "만료" : "유효";
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                      <span className="font-mono font-medium">{c.number}</span>
                      <span className="tabular text-zinc-500">
                        {formatDate(c.issuedAt)} ~ {c.expiresAt ? formatDate(c.expiresAt) : "영구"}
                      </span>
                      <span className="ml-auto">
                        <Badge tone={state === "유효" ? "green" : state === "만료" ? "amber" : "red"}>{state}</Badge>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card title="처리 이력" padded={false}>
            {history.length === 0 ? (
              <p className="px-4 py-3 text-[12.5px] text-muted">기록이 없습니다.</p>
            ) : (
              <ol className="divide-y divide-zinc-100">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                    <span className="tabular w-[132px] shrink-0 text-[12px] text-zinc-500">{formatDateTime(h.at)}</span>
                    <span className="font-medium">{AUDIT_ACTION_LABEL[h.action] ?? h.action}</span>
                    <span className="ml-auto text-[12px] text-muted">{h.actor}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <EvaluationPanel
            key={`${app.status}-${app.updatedAt.getTime()}`}
            id={app.id}
            status={app.status}
            canEvaluate={can(user.role, "credential.evaluate")}
            thresholds={p}
            initial={{
              examScore: app.examScore?.toString() ?? "",
              practicalScore: app.practicalScore?.toString() ?? "",
              evaluatorNote: app.evaluatorNote ?? "",
            }}
            evaluatorName={app.evaluator ? (app.evaluator.name ?? app.evaluator.email) : null}
          />
          <DecisionPanel
            key={`d-${app.status}`}
            id={app.id}
            status={app.status}
            canApprove={can(user.role, "credential.approve")}
            passed={passed}
            prerequisitesDone={prerequisitesDone}
            decisionNote={app.decisionNote}
            decidedAt={app.decidedAt ? formatDateTime(app.decidedAt) : null}
            issuedNumber={issued?.number ?? null}
            validity={validityLabel(p.validityMonths)}
          />
          <Card title="평가 기준">
            <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-[13px]">
              <dt className="text-muted">시험</dt>
              <dd className="tabular">{p.examPassingScore}점 이상</dd>
              <dt className="text-muted">실기</dt>
              <dd className="tabular">{p.practicalRequired ? `${p.practicalPassingScore}점 이상` : "없음"}</dd>
              <dt className="text-muted">유효기간</dt>
              <dd>{validityLabel(p.validityMonths)}</dd>
            </dl>
            {p.criteria && <p className="mt-3 whitespace-pre-wrap border-t border-line pt-3 text-[12.5px] leading-relaxed text-zinc-600">{p.criteria}</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
