import { requirePage } from '@/lib/session';
import { PageHeader } from '@/components/ui';
import { getPartners } from '@bayada/korea/server';
import { KoreaPartnersEditor } from '@/components/korea/KoreaPartnersEditor';
export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requirePage('korea.content', locale); const data = await getPartners();
  return <><PageHeader title="바야다코리아 협력기관" description="메인 로고 슬라이더의 기관·이미지·링크·노출 순서를 관리합니다." /><KoreaPartnersEditor key={data.updatedAt} initial={data.items} updatedAt={data.updatedAt} /></>;
}
