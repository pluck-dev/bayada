import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { getProgram, getProgramHistory, lectureCount } from "@/lib/queries/programs";
import { LOCKED_STATUSES, requiredChecklist } from "@/lib/workflow";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, PRODUCT_TYPE_LABEL, formatDateTime } from "@/lib/labels";
import { Badge, Card, PageHeader, tabBarClass, tabClass } from "@/components/ui";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { CurriculumEditor } from "@/components/programs/CurriculumEditor";
import { HistoryTimeline } from "@/components/programs/HistoryTimeline";
import { Checklist, WorkflowPanel } from "@/components/programs/WorkflowPanel";

const TABS = [
  { key: "basic", label: "기본정보" },
  { key: "curriculum", label: "커리큘럼" },
  { key: "history", label: "상태·이력" },
] as const;

export default async function PartnerProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale, id } = await params;
  const user = await requirePage("partner.console", locale);
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? rawTab! : "basic";

  const program = await getProgram(id);
  // 다른 기관 프로그램은 존재 여부도 드러내지 않는다
  if (!program || program.providerId !== user.providerId) notFound();
  const [categories, history] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true } }),
    tab === "history" ? getProgramHistory(id) : Promise.resolve([]),
  ]);

  const locked = LOCKED_STATUSES.includes(program.status) || program.status === "PUBLISHED" || program.status === "ARCHIVED";
  const checklist = requiredChecklist({ ...program, lectureCount: lectureCount(program) }, program.provider?.name);
  const base = `/${locale}/partner-console/programs/${id}`;

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/partner-console`, label: "파트너 콘솔" }}
        title={program.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={COURSE_STATUS_TONE[program.status]} dot>
              {COURSE_STATUS_LABEL[program.status]}
            </Badge>
            <span>{PRODUCT_TYPE_LABEL[program.productType]}</span>
            <span className="text-subtle">·</span>
            <span>수강자 {program._count.enrollments.toLocaleString()}명</span>
            <span className="text-subtle">·</span>
            <span>수정 {formatDateTime(program.updatedAt)}</span>
          </span>
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
          {locked && tab !== "history" && (
            <div className="mb-4 rounded-2xl bg-pill-info/70 px-4 py-3 text-[13px] font-medium text-info">
              {program.status === "PUBLISHED" || program.status === "ARCHIVED"
                ? `${COURSE_STATUS_LABEL[program.status]} 상태라 파트너 콘솔에서는 고칠 수 없습니다. 변경이 필요하면 바야다 운영자에게 요청하세요.`
                : `${COURSE_STATUS_LABEL[program.status]} 단계라 편집이 잠겨 있습니다. 검토자가 수정 요청하면 다시 고칠 수 있습니다.`}
            </div>
          )}

          {tab === "basic" && (
            <ProgramForm
              key={program.updatedAt.toISOString()}
              locale={locale}
              programId={id}
              locked={locked}
              partner
              basePath={`/${locale}/partner-console/programs`}
              categories={categories}
              providers={program.provider ? [{ ...program.provider, isPartner: true }] : []}
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
          <Card tour="program-workflow" title="승인 요청">
            <WorkflowPanel courseId={id} status={program.status} permissions={user.permissions} checklist={checklist} />
          </Card>
          <p className="px-1 text-caption text-muted">검토·승인·게시는 바야다 운영자와 임상 리뷰어가 진행합니다.</p>
        </aside>
      </div>
    </>
  );
}
