import { requirePage } from "@/lib/session";
import { getFormOptions } from "@/lib/queries/programs";
import { PageHeader } from "@/components/ui";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { EMPTY_PROGRAM } from "@/lib/program-defaults";

export default async function NewProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("program.write", locale);
  const { categories, providers } = await getFormOptions();
  // 제공기관이 하나뿐이면(현재 바야다 자체) 기본 선택
  const initial = { ...EMPTY_PROGRAM, providerId: providers.length === 1 ? providers[0].id : "" };

  return (
    <div className="max-w-[860px]">
      <PageHeader
        title="새 프로그램"
        description="작성 중(draft) 상태로 만들어집니다. 커리큘럼까지 채운 뒤 승인 요청하세요."
        back={{ href: `/${locale}/programs`, label: "프로그램" }}
      />
      <ProgramForm locale={locale} initial={initial} categories={categories} providers={providers} />
    </div>
  );
}
