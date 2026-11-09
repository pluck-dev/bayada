import { VISIT_CONDITION_LABEL, type VisitConditionKey } from "@bayada/shared/member";
import { Badge, CONDITION_TONE, InfoList, fmtDateTime } from "./ui";

type Vitals = { bloodPressureSys: number | null; bloodPressureDia: number | null; bloodSugar: number | null; temperature: number | null; heartRate: number | null; weight: number | null };

export function vitalsText(v: Vitals): string {
  const parts = [
    v.bloodPressureSys ? `혈압 ${v.bloodPressureSys}/${v.bloodPressureDia}` : null,
    v.bloodSugar != null ? `혈당 ${v.bloodSugar}` : null,
    v.temperature != null ? `체온 ${v.temperature}°C` : null,
    v.heartRate != null ? `맥박 ${v.heartRate}` : null,
    v.weight != null ? `체중 ${v.weight}kg` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** 방문 기록 열람 (이용자·보호자 — 읽기 전용) */
export function VisitReport({
  visit,
}: {
  visit: {
    startedAt: Date;
    completedAt: Date;
    serviceProvided: string[];
    patientCondition: string;
    notes: string;
    nextVisitNotes: string | null;
    staff: { name: string | null };
    healthRecords?: Vitals[];
  };
}) {
  const vitals = visit.healthRecords?.[0];
  const hm = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  return (
    <div className="flex flex-col gap-4">
      <InfoList
        items={[
          ["방문 시간", `${fmtDateTime(visit.startedAt)} ~ ${hm(visit.completedAt)}`],
          ["담당", visit.staff.name ?? "-"],
          [
            "이용자 상태",
            <Badge key="c" tone={CONDITION_TONE[visit.patientCondition]} dot>
              {VISIT_CONDITION_LABEL[visit.patientCondition as VisitConditionKey]}
            </Badge>,
          ],
          ["제공 서비스", visit.serviceProvided.join(", ")],
          ...(vitals ? ([["활력징후", vitalsText(vitals)]] as [string, string][]) : []),
        ]}
      />
      <div className="rounded-xl bg-[#f8f9fa] p-4">
        <p className="text-xs font-semibold text-[color:var(--muted)]">방문 기록</p>
        <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{visit.notes}</p>
      </div>
      {visit.nextVisitNotes && (
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700">다음 방문 참고</p>
          <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-blue-950">{visit.nextVisitNotes}</p>
        </div>
      )}
    </div>
  );
}
