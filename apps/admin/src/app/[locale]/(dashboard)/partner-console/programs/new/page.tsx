import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { EMPTY_PROGRAM } from "@/lib/program-defaults";

export default async function PartnerNewProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("partner.console", locale);
  const [categories, provider] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true } }),
    prisma.provider.findUnique({ where: { id: user.providerId! }, select: { id: true, name: true, isPartner: true } }),
  ]);
  const base = `/${locale}/partner-console`;

  return (
    <div className="max-w-[860px]">
      <PageHeader
        title="프로그램 등록"
        description="작성 중(draft)으로 만들어집니다. 커리큘럼까지 채운 뒤 승인 요청하세요."
        back={{ href: base, label: "파트너 콘솔" }}
      />
      <ProgramForm
        locale={locale}
        partner
        basePath={`${base}/programs`}
        initial={{ ...EMPTY_PROGRAM, providerId: provider?.id ?? "", visibility: "PUBLIC" }}
        categories={categories}
        providers={provider ? [provider] : []}
      />
    </div>
  );
}
