import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { getCredentialProgram, requiredCourseOptions } from "@/lib/queries/credentials";
import { OPEN_APP_STATUSES } from "@/lib/credentials";
import { Badge, LinkButton, PageHeader } from "@/components/ui";
import { CredentialProgramForm } from "@/components/credentials/CredentialProgramForm";
import type { CredentialProgramInput } from "@/lib/actions/credentials";

export default async function CredentialProgramPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("credential.program", locale);
  const p = await getCredentialProgram(id);
  if (!p) notFound();
  const [courses, pending] = await Promise.all([
    requiredCourseOptions(p.requiredCourseIds),
    prisma.credentialApplication.count({ where: { programId: id, status: { in: OPEN_APP_STATUSES } } }),
  ]);
  const initial: CredentialProgramInput = {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    description: p.description ?? "",
    requiredCourseIds: p.requiredCourseIds,
    examPassingScore: p.examPassingScore,
    practicalRequired: p.practicalRequired,
    practicalPassingScore: p.practicalPassingScore,
    validityMonths: p.validityMonths?.toString() ?? "",
    renewalNoticeDays: p.renewalNoticeDays,
    criteria: p.criteria ?? "",
    active: p.active,
  };

  return (
    <div className="max-w-[860px]">
      <PageHeader
        back={{ href: `/${locale}/credentials/programs`, label: "인증 과정" }}
        title={p.title}
        description={
          <span className="flex items-center gap-2">
            {p.active ? (
              <Badge tone="green" dot>
                공개
              </Badge>
            ) : (
              <Badge tone="slate">비공개</Badge>
            )}
            <span>
              신청 {p._count.applications}건 · 발급 {p._count.credentials}건
            </span>
          </span>
        }
        actions={
          p._count.applications > 0 && (
            <LinkButton href={`/${locale}/credentials?program=${p.id}`} size="sm">
              이 과정 심사 큐
            </LinkButton>
          )
        }
      />
      <CredentialProgramForm
        key={p.updatedAt.getTime()}
        locale={locale}
        programId={id}
        courses={courses}
        initial={initial}
        records={p._count.applications + p._count.credentials}
        pending={pending}
      />
    </div>
  );
}
