import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePage } from "@/lib/session";
import { listSessions, type SessionScope } from "@/lib/queries/sessions";
import { formatDate, formatDateTime } from "@/lib/labels";
import {
  Badge,
  EmptyState,
  FilterChip,
  LinkButton,
  PageHeader,
  cx,
  qs,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";

export default async function SessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string }>;
}) {
  const { locale } = await params;
  await requirePage("session", locale);
  const sp = await searchParams;
  const scope: SessionScope = sp.scope === "past" || sp.scope === "all" ? sp.scope : "upcoming";
  const { rows, counts } = await listSessions(scope);
  const base = `/${locale}/sessions`;
  const now = Date.now();

  return (
    <>
      <PageHeader
        title="실습·오프라인 일정"
        description="블렌디드·오프라인 과정의 실습 회차를 관리합니다. 정원과 신청자 명단을 확인하고 CSV 로 내려받을 수 있습니다."
        actions={
          <LinkButton href={`${base}/new`} variant="primary">
            <Plus className="h-3.5 w-3.5" aria-hidden />새 일정
          </LinkButton>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="기간">
        <FilterChip href={base} active={scope === "upcoming"} count={counts.upcoming}>
          예정·진행 중
        </FilterChip>
        <FilterChip href={qs(base, { scope: "past" })} active={scope === "past"} count={counts.past}>
          종료
        </FilterChip>
        <FilterChip href={qs(base, { scope: "all" })} active={scope === "all"} count={counts.all}>
          전체
        </FilterChip>
      </div>

      <div className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title={scope === "past" ? "종료된 일정이 없습니다" : "예정된 실습 일정이 없습니다"}
            description={scope === "past" ? undefined : "새 일정을 만들면 학습자가 아카데미에서 신청할 수 있습니다."}
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>일정</th>
                <th className={thClass}>지역 · 장소</th>
                <th className={thClass}>일시</th>
                <th className={thClass}>신청 / 정원</th>
                <th className={thClass}>상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const n = s._count.registrations;
                const full = n >= s.capacity;
                const pct = Math.min(100, (n / s.capacity) * 100);
                const ongoing = s.startsAt.getTime() <= now && s.endsAt.getTime() >= now;
                const ended = s.endsAt.getTime() < now;
                return (
                  <tr key={s.id} className={trClass}>
                    <td className={cx(tdClass, "min-w-[260px] whitespace-normal!")}>
                      <Link href={`${base}/${s.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                        {s.title}
                      </Link>
                      {s.course && <p className="mt-0.5 text-micro text-subtle">{s.course.title}</p>}
                    </td>
                    <td className={cx(tdClass, "max-w-[260px] truncate text-muted")} data-tip={s.location}>
                      <span className="font-medium text-ink">{s.region}</span> · {s.location}
                    </td>
                    <td className={cx(tdClass, "tabular text-muted")}>
                      {formatDateTime(s.startsAt)}
                      <span className="text-subtle">
                        {" ~ "}
                        {formatDate(s.startsAt) === formatDate(s.endsAt) ? formatDateTime(s.endsAt).slice(-5) : formatDateTime(s.endsAt)}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-sunken">
                          <span className={cx("block h-full rounded-full", full ? "bg-brand" : "bg-zinc-700")} style={{ width: `${pct}%` }} />
                        </span>
                        <span className="tabular text-caption text-ink-soft">
                          {n} / {s.capacity}
                        </span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      {ended ? (
                        <Badge tone="slate">종료</Badge>
                      ) : ongoing ? (
                        <Badge tone="blue" dot>
                          진행 중
                        </Badge>
                      ) : full ? (
                        <Badge tone="red">마감</Badge>
                      ) : (
                        <Badge tone="green" dot>
                          모집 중
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
