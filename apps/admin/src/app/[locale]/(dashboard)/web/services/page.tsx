import { prisma } from "@bayada/db";
import { parseWebServiceDocument, WEB_SERVICE_PREFIX } from "@bayada/shared/web-services";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { WebServiceManager } from "@/components/web/WebServiceManager";

export default async function WebServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePage("web.content", locale);
  const rows = await prisma.page.findMany({ where: { slug: { startsWith: WEB_SERVICE_PREFIX } }, orderBy: { title: "asc" } });
  return <><PageHeader title="서비스 소개" description="서비스 카드·상세 본문·이용 절차·FAQ를 관리합니다. 숨기거나 삭제하면 목록과 상세 페이지에서 제외됩니다." /><WebServiceManager rows={rows.map((row) => ({ doc: parseWebServiceDocument(JSON.parse(row.content)), updatedAt: row.updatedAt.toISOString() }))} /></>;
}
