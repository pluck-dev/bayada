import { requirePage } from "@/lib/session";
import { stepLinkOptions } from "@/lib/queries/pathways";
import { PageHeader } from "@/components/ui";
import { PathwayForm } from "@/components/pathways/PathwayForm";

export default async function NewPathwayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("pathway", locale);
  const options = await stepLinkOptions();

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="새 커리어 패스웨이"
        description="만든 뒤에는 비공개 상태입니다. 내용·정보 기준일을 확인하고 게시하세요."
        back={{ href: `/${locale}/pathways`, label: "커리어 패스웨이" }}
      />
      <PathwayForm
        locale={locale}
        options={options}
        updatedAt={null}
        initial={{
          slug: "",
          title: "",
          country: "",
          jobRole: "",
          summary: "",
          content: "",
          infoAsOf: "",
          disclaimer: "",
          coverImage: "",
          order: 0,
        }}
        initialSteps={[]}
      />
    </div>
  );
}
