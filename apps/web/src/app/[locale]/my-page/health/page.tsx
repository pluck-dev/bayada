import { kstToday } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { listHealthRecords } from "@/lib/member/queries";
import { HealthEntryForm } from "@/components/member/HealthEntryForm";
import { HealthRecords } from "@/components/member/HealthRecords";
import { Card, Notice, PageTitle } from "@/components/member/ui";

export default async function HealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/health");
  if (m.webMemberProfile.memberType !== "SERVICE_USER") {
    return <Notice>건강 기록은 서비스 이용자 본인이 관리해요. 보호자는 &lsquo;가족 연결&rsquo;에서 가족의 기록을 볼 수 있어요.</Notice>;
  }
  const rows = await listHealthRecords(m.id);
  const now = new Date(Date.now() + 9 * 3600_000);
  const slot = `${String(now.getUTCHours()).padStart(2, "0")}:${now.getUTCMinutes() < 30 ? "00" : "30"}`;
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="건강 기록" description="혈압·혈당·체온·맥박·체중을 기록하고 추이를 확인해요. 연결된 보호자도 함께 볼 수 있어요." />
      <Card title="오늘 측정값 기록">
        <HealthEntryForm today={kstToday()} nowSlot={slot} />
      </Card>
      <HealthRecords rows={rows} editable />
    </div>
  );
}
