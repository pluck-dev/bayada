import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { getMenu } from "@bayada/korea/server";
import { KoreaMenuEditor } from "@/components/korea/KoreaMenuEditor";
export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requirePage("korea.content", locale); const menu = await getMenu();
  return <><PageHeader title="바야다코리아 메뉴" description="PC·모바일 공통 메뉴의 이름·링크·순서·하위 메뉴를 관리합니다." /><KoreaMenuEditor key={menu.updatedAt} initial={menu.items} updatedAt={menu.updatedAt} /></>;
}
