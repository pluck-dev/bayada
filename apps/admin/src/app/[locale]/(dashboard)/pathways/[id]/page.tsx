import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { getPathway, stepLinkOptions } from "@/lib/queries/pathways";
import { formatDateTime } from "@/lib/labels";
import { Badge, PageHeader } from "@/components/ui";
import { PathwayForm } from "@/components/pathways/PathwayForm";

export default async function PathwayEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("pathway", locale);
  const p = await getPathway(id);
  if (!p) notFound();
  const options = await stepLinkOptions({
    courseIds: p.steps.map((s) => s.courseId).filter((x): x is string => !!x),
    credentialIds: p.steps.map((s) => s.credentialProgramId).filter((x): x is string => !!x),
  });

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        back={{ href: `/${locale}/pathways`, label: "커리어 패스웨이" }}
        title={p.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {p.published ? (
              <Badge tone="green" dot>
                게시 중
              </Badge>
            ) : (
              <Badge tone="slate">비공개</Badge>
            )}
            <span>{p.country}</span>
            <span className="text-subtle">·</span>
            <span className="font-mono text-caption">/pathways/{p.slug}</span>
            <span className="text-subtle">·</span>
            <span>목표 설정 {p._count.goals.toLocaleString()}명</span>
            <span className="text-subtle">·</span>
            <span>최종 수정 {formatDateTime(p.updatedAt)}</span>
          </span>
        }
      />
      <PathwayForm
        // 저장·게시 후 서버 값으로 폼을 다시 맞춘다
        key={`${p.updatedAt.toISOString()}-${p.published}`}
        locale={locale}
        pathwayId={p.id}
        published={p.published}
        goals={p._count.goals}
        options={options}
        updatedAt={p.updatedAt.toISOString()}
        initial={{
          slug: p.slug,
          title: p.title,
          country: p.country,
          jobRole: p.jobRole ?? "",
          summary: p.summary ?? "",
          content: p.content ?? "",
          infoAsOf: p.infoAsOf ? p.infoAsOf.toISOString().slice(0, 10) : "",
          disclaimer: p.disclaimer ?? "",
          coverImage: p.coverImage ?? "",
          order: p.order,
        }}
        initialSteps={p.steps.map((s) => ({
          title: s.title,
          description: s.description ?? "",
          link: s.courseId ? "course" : s.credentialProgramId ? "credential" : "none",
          courseId: s.courseId ?? "",
          credentialProgramId: s.credentialProgramId ?? "",
        }))}
      />
    </div>
  );
}
