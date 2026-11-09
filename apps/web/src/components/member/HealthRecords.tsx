import type { HealthRow } from "@/lib/member/queries";
import { HealthChart } from "./HealthChart";
import { DeleteRecordButton } from "./HealthEntryForm";
import { vitalsText } from "./VisitReport";
import { Badge, Card, EmptyState, fmtDateTime } from "./ui";

/** 추이 차트 + 기록 목록(차트의 표 보기). editable 이면 본인이 입력한 기록에 지우기 버튼 */
export function HealthRecords({ rows, editable }: { rows: HealthRow[]; editable?: boolean }) {
  const points = rows.map((r) => ({
    t: r.recordedAt.getTime(),
    sys: r.bloodPressureSys,
    dia: r.bloodPressureDia,
    bloodSugar: r.bloodSugar,
    temperature: r.temperature,
    heartRate: r.heartRate,
    weight: r.weight,
  }));
  return (
    <>
      <Card title="추이">
        <HealthChart points={points} />
      </Card>
      <Card title={`기록 ${rows.length}건`} description="최근 90일">
        {rows.length === 0 ? (
          <EmptyState title="아직 기록이 없어요" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm tabular-nums text-[color:var(--muted)]">{fmtDateTime(r.recordedAt)}</span>
                    {r.source === "STAFF" && <Badge tone="blue">방문 인력 기록{r.recordedBy?.name ? ` · ${r.recordedBy.name}` : ""}</Badge>}
                    {r.hasAlert && <Badge tone={r.alertType === "URGENT" ? "red" : "amber"}>{r.alertType === "URGENT" ? "이상 징후" : "주의"}</Badge>}
                  </div>
                  <p className="mt-1 text-[15px] font-semibold tabular-nums">{vitalsText(r)}</p>
                  {r.notes && <p className="mt-0.5 text-sm text-[color:var(--muted)]">{r.notes}</p>}
                </div>
                {editable && r.source === "SELF" && <DeleteRecordButton id={r.id} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
