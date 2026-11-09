import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getProgram, getProgramHistory, lectureCount } from "@/lib/queries/programs";
import { requiredChecklist } from "@/lib/workflow";
import {
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  JOB_ROLE_LABEL,
  LECTURE_TYPE_LABEL,
  LEVEL_LABEL,
  PRODUCT_TYPE_LABEL,
} from "@/lib/labels";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Checklist, WorkflowPanel } from "@/components/programs/WorkflowPanel";
import { HistoryTimeline } from "@/components/programs/HistoryTimeline";
import { VisibilityPill } from "@/components/programs/ProgramTable";

export default async function ReviewPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("approval.queue", locale);
  const program = await getProgram(id);
  if (!program) notFound();
  // 임상 리뷰만 처리하는 역할은 임상 검토 단계 항목만 본다
  const clinicalOnly = can(user, "workflow.clinical") && !can(user, "workflow.operate");
  if (clinicalOnly && program.status !== "CLINICAL_REVIEW") notFound();

  const history = await getProgramHistory(id);
  const checklist = requiredChecklist({ ...program, lectureCount: lectureCount(program) }, program.provider?.name);

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/approvals`, label: "승인 대기" }}
        title={`승인 대기 · ${program.title}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={COURSE_STATUS_TONE[program.status]} dot>
              {COURSE_STATUS_LABEL[program.status]}
            </Badge>
            <VisibilityPill value={program.visibility} />
            {can(user, "program.read") && (
              <Link href={`/${locale}/programs/${id}`} className="text-caption underline-offset-2 transition-colors hover:text-brand">
                프로그램 편집 화면 열기
              </Link>
            )}
          </span>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
        <div data-tour="approval-content" className="flex min-w-0 flex-col gap-4">
          <Card title="필수 필드 체크">
            <Checklist items={checklist} />
          </Card>

          <Card title="프로그램 요약">
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2.5 text-caption">
              <dt className="text-muted">유형</dt>
              <dd>
                {PRODUCT_TYPE_LABEL[program.productType]}
                {program.level && ` · ${LEVEL_LABEL[program.level]}`}
              </dd>
              <dt className="text-muted">대상 직군</dt>
              <dd>{program.audiences.map((a) => JOB_ROLE_LABEL[a]).join(", ") || "-"}</dd>
              <dt className="text-muted">제공기관</dt>
              <dd>{program.provider?.name ?? "-"}</dd>
              <dt className="text-muted">소요시간</dt>
              <dd>{program.durationMin ? `${program.durationMin}분` : "-"}</dd>
              <dt className="text-muted">한 줄 소개</dt>
              <dd>{program.summary ?? "-"}</dd>
              <dt className="text-muted">학습목표</dt>
              <dd>
                {program.objectives.length ? (
                  <ol className="list-decimal space-y-1 pl-4">
                    {program.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ol>
                ) : (
                  "-"
                )}
              </dd>
            </dl>
          </Card>

          <Card title={`커리큘럼 · 레슨 ${lectureCount(program)}개`}>
            {program.sections.length === 0 ? (
              <p className="text-caption text-muted">커리큘럼이 없습니다.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {program.sections.map((s, i) => (
                  <li key={s.id}>
                    <p className="text-caption font-semibold">
                      {i + 1}. {s.title}
                    </p>
                    <ul className="mt-1 flex flex-col gap-0.5 pl-4 text-caption text-muted">
                      {s.lectures.map((l) => (
                        <li key={l.id}>
                          <span className="text-subtle">[{LECTURE_TYPE_LABEL[l.type]}]</span> {l.title}
                          {l.quiz && <span className="text-subtle"> · {l.quiz.questions.length}문항</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="이력">
            <HistoryTimeline entries={history} publishedAt={program.publishedAt} />
          </Card>
        </div>

        <aside data-tour="program-workflow" className="surface-card sticky top-6 rounded-[22px] bg-canvas p-5">
          <h2 className="mb-3 text-body-sm font-semibold">검토</h2>
          <WorkflowPanel courseId={id} status={program.status} permissions={user.permissions} checklist={checklist} afterHref={clinicalOnly ? `/${locale}/approvals` : undefined}
          />
        </aside>
      </div>
    </>
  );
}
