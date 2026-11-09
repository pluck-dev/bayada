import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getFormOptions, getProgram, getProgramHistory, lectureCount } from "@/lib/queries/programs";
import { LOCKED_STATUSES, requiredChecklist } from "@/lib/workflow";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, PRODUCT_TYPE_LABEL, formatDateTime } from "@/lib/labels";
import { Badge, Card, PageHeader, tabBarClass, tabClass } from "@/components/ui";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { CurriculumEditor } from "@/components/programs/CurriculumEditor";
import { HistoryTimeline } from "@/components/programs/HistoryTimeline";
import { Checklist, WorkflowPanel } from "@/components/programs/WorkflowPanel";
import { VisibilityPill } from "@/components/programs/ProgramTable";
import { DeleteProgramButton } from "@/components/programs/DeleteProgramButton";

const TABS = [
  { key: "basic", label: "기본정보" },
  { key: "curriculum", label: "커리큘럼" },
  { key: "history", label: "상태·이력" },
] as const;

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale, id } = await params;
  const user = await requirePage("program.read", locale);
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? rawTab! : "basic";

  const program = await getProgram(id);
  if (!program) notFound();
  const [options, history] = await Promise.all([getFormOptions(), tab === "history" ? getProgramHistory(id) : Promise.resolve([])]);

  const canWrite = can(user, "program.write");
  const locked = !canWrite || LOCKED_STATUSES.includes(program.status);
  const checklist = requiredChecklist({ ...program, lectureCount: lectureCount(program) }, program.provider?.name);
  const base = `/${locale}/programs/${id}`;

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/programs`, label: "프로그램" }}
        title={program.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={COURSE_STATUS_TONE[program.status]} dot>
              {COURSE_STATUS_LABEL[program.status]}
            </Badge>
            <VisibilityPill value={program.visibility} />
            <span className="text-subtle">·</span>
            <span>{PRODUCT_TYPE_LABEL[program.productType]}</span>
            <span className="text-subtle">·</span>
            <span>수강생 {program._count.enrollments.toLocaleString()}명</span>
            <span className="text-subtle">·</span>
            <span>수정 {formatDateTime(program.updatedAt)}</span>
          </span>
        }
        actions={
          canWrite &&
          (program.status === "DRAFT" || program.status === "CHANGES_REQUESTED") &&
          program._count.enrollments === 0 && <DeleteProgramButton id={id} title={program.title} locale={locale} />
        }
      />

      <nav data-tour="program-tabs" className={tabBarClass} aria-label="프로그램 편집 탭">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "basic" ? base : `${base}?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={tabClass(tab === t.key)}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-6">
        <div className="min-w-0">
          {locked && canWrite && (
            <div className="mb-4 rounded-2xl bg-pill-info/70 px-4 py-3 text-[13px] font-medium text-info">
              {COURSE_STATUS_LABEL[program.status]} 단계라 편집이 잠겨 있습니다. 내용을 고치려면 검토자가 수정 요청해야 합니다.
            </div>
          )}
          {program.status === "PUBLISHED" && canWrite && tab !== "history" && (
            <div className="mb-4 rounded-2xl bg-pill-warning/70 px-4 py-3 text-[13px] font-medium text-warning">
              게시 중인 프로그램입니다. 저장하면 학습자 화면에 바로 반영됩니다.
            </div>
          )}

          {tab === "basic" && (
            <ProgramForm
              key={program.updatedAt.toISOString()}
              locale={locale}
              programId={id}
              locked={locked}
              categories={options.categories}
              providers={options.providers}
              initial={{
                title: program.title,
                slug: program.slug,
                summary: program.summary ?? "",
                description: program.description ?? "",
                thumbnail: program.thumbnail ?? "",
                coverMode: program.coverMode,
                price: program.price,
                productType: program.productType,
                learningMode: program.learningMode,
                level: program.level ?? "",
                audiences: program.audiences,
                categoryId: program.categoryId ?? "",
                providerId: program.providerId ?? "",
                durationMin: program.durationMin,
                objectives: program.objectives.length ? program.objectives : [""],
                featured: program.featured,
                visibility: program.visibility,
              }}
            />
          )}
          {tab === "curriculum" && (
            <CurriculumEditor
              courseId={id}
              locked={locked}
              sections={program.sections.map((s) => ({
                id: s.id,
                title: s.title,
                lectures: s.lectures.map((l) => ({
                  id: l.id,
                  title: l.title,
                  type: l.type,
                  videoUrl: l.videoUrl,
                  content: l.content,
                  duration: l.duration,
                  isFree: l.isFree,
                  quiz: l.quiz
                    ? {
                        passingScore: l.quiz.passingScore,
                        questions: l.quiz.questions.map((q) => ({ id: q.id, type: q.type, text: q.text, options: q.options })),
                      }
                    : null,
                })),
              }))}
            />
          )}
          {tab === "history" && <HistoryTimeline entries={history} publishedAt={program.publishedAt} />}
        </div>

        <aside className="sticky top-0 flex flex-col gap-4">
          {program.status === "CHANGES_REQUESTED" && program.reviewNote && (
            <div className="rounded-2xl bg-pill-warning/60 p-4">
              <p className="text-caption font-semibold text-warning">수정 요청 사유</p>
              <p className="mt-1 whitespace-pre-wrap text-caption text-warning">{program.reviewNote}</p>
            </div>
          )}
          <Card tour="program-checklist" title="필수 항목 체크">
            <Checklist items={checklist} />
          </Card>
          <Card tour="program-workflow" title="워크플로우">
            <WorkflowPanel courseId={id} status={program.status} permissions={user.permissions} checklist={checklist} />
          </Card>
          {program.publishedAt && <p className="px-1 text-caption text-muted">최초/최근 게시 {formatDateTime(program.publishedAt)}</p>}
        </aside>
      </div>
    </>
  );
}
