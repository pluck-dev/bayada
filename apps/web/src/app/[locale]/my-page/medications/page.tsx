import { kstToday } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { todayMedications, weeklyAdherence } from "@/lib/member/queries";
import { AddMedicationForm, MedicationRowActions, TodayChecklist } from "@/components/member/Medications";
import { Badge, Card, EmptyState, Notice, PageTitle, fmtDay } from "@/components/member/ui";

export default async function MedicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/medications");
  if (m.webMemberProfile.memberType !== "SERVICE_USER") {
    return <Notice>복약 관리는 서비스 이용자 본인이 해요. 보호자는 &lsquo;가족 연결&rsquo;에서 가족의 복약 상태를 볼 수 있어요.</Notice>;
  }
  const [{ meds, due, total, taken, inPeriod }, weekly] = await Promise.all([todayMedications(m.id), weeklyAdherence(m.id)]);
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="복약 관리" description="복용할 약과 시각을 등록하고, 먹을 때마다 체크해요. 연결된 보호자도 복약 상태를 볼 수 있어요." />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-sm font-semibold text-[color:var(--muted)]">오늘</p>
          <p className="mt-1 text-[24px] font-bold tabular-nums">{total ? `${taken} / ${total}` : "-"}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-sm font-semibold text-[color:var(--muted)]">최근 7일 복약률</p>
          <p className="mt-1 text-[24px] font-bold tabular-nums">{weekly === null ? "-" : `${weekly}%`}</p>
        </div>
      </div>
      <Card title="오늘 복약 체크" description="먹은 시각을 누르면 복용으로 바뀌어요. 다시 누르면 취소돼요.">
        {due.length === 0 ? (
          <EmptyState title="오늘 먹을 약이 없어요" description="아래에서 약을 추가해 보세요." />
        ) : (
          <TodayChecklist editable meds={due.map((d) => ({ id: d.id, name: d.name, dosage: d.dosage, timeSlots: d.timeSlots, instructions: d.instructions, taken: d.logs.filter((l) => l.isTaken).map((l) => l.scheduledTime) }))} />
        )}
      </Card>
      <Card title={`등록한 약 ${meds.length}개`}>
        <AddMedicationForm today={kstToday()} />
        {meds.length === 0 ? null : (
          <ul className="mt-2 divide-y divide-gray-100">
            {meds.map((d) => (
              <li key={d.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-bold">{d.name}</p>
                    {inPeriod(d) ? <Badge tone="green">복용 중</Badge> : !d.isActive ? <Badge>중단</Badge> : <Badge tone="amber">기간 밖</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-[color:var(--muted)]">
                    {d.dosage} · {d.timeSlots.join(", ")} · {fmtDay(d.startDate)}부터{d.endDate ? ` ${fmtDay(d.endDate)}까지` : ""}
                  </p>
                  {(d.instructions || d.prescribedBy) && <p className="text-sm text-[color:var(--muted)]">{[d.instructions, d.prescribedBy].filter(Boolean).join(" · ")}</p>}
                </div>
                <MedicationRowActions id={d.id} name={d.name} active={d.isActive} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
