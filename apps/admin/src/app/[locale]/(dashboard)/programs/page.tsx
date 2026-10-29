import { Plus } from "lucide-react";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { listPrograms } from "@/lib/queries/programs";
import { COURSE_STATUSES, COURSE_STATUS_LABEL } from "@/lib/labels";
import { FilterChip, LinkButton, PageHeader, qs } from "@/components/ui";
import { ProgramTable } from "@/components/programs/ProgramTable";
import { SearchBox } from "@/components/SearchBox";

export default async function ProgramsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; visibility?: string }>;
}) {
  const { locale } = await params;
  const user = await requirePage("program.read", locale);
  const sp = await searchParams;
  const { rows, counts } = await listPrograms(sp);
  const base = `/${locale}/programs`;
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const link = (patch: Record<string, string | undefined>) => qs(base, { q: sp.q, status: sp.status, visibility: sp.visibility, ...patch });

  return (
    <>
      <PageHeader
        title="프로그램"
        description="강좌·트랙의 상태와 공개범위를 관리합니다. 사내 전용 강좌를 선택해 외부 플랫폼에 공개할 수 있습니다."
        actions={
          can(user.role, "program.write") && (
            <LinkButton href={`${base}/new`} variant="primary">
              <Plus className="h-3.5 w-3.5" aria-hidden />새 프로그램
            </LinkButton>
          )
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox placeholder="프로그램명·slug 검색" />
        <div className="ml-auto flex items-center gap-1.5" role="group" aria-label="공개범위">
          <FilterChip href={link({ visibility: undefined })} active={!sp.visibility}>
            전체 공개범위
          </FilterChip>
          <FilterChip href={link({ visibility: "INTERNAL" })} active={sp.visibility === "INTERNAL"}>
            사내
          </FilterChip>
          <FilterChip href={link({ visibility: "PUBLIC" })} active={sp.visibility === "PUBLIC"}>
            외부
          </FilterChip>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="상태">
        <FilterChip href={link({ status: undefined })} active={!sp.status} count={total}>
          전체
        </FilterChip>
        {COURSE_STATUSES.map((s) => (
          <FilterChip key={s} href={link({ status: s })} active={sp.status === s} count={counts[s] ?? 0}>
            {COURSE_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <ProgramTable rows={rows} locale={locale} canWrite={can(user.role, "program.write")} />
    </>
  );
}
