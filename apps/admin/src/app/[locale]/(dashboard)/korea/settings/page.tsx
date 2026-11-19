import { requirePage } from '@/lib/session';
import { PageHeader } from '@/components/ui';
import { getInquirySettings } from '@bayada/korea/server';
import { KoreaSettingsEditor } from '@/components/korea/KoreaSettingsEditor';
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requirePage('korea.inquiries', locale); const { settings, updatedAt } = await getInquirySettings();
  const delivery = !process.env.SMTP_URL ? '미설정' : /mailpit|localhost|127\.0\.0\.1/.test(process.env.SMTP_URL) ? '개발용 수신함 (외부 이메일 발송 아님)' : 'SMTP 설정됨 · 실제 수신 검수 필요';
  return <><PageHeader title="바야다코리아 접수 설정" description="서비스 상담·채용 접수와 알림 수신 주소를 설정합니다." /><KoreaSettingsEditor key={updatedAt} initial={settings} updatedAt={updatedAt} delivery={delivery} /></>;
}
