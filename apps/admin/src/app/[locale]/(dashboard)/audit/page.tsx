import Link from "next/link";
import { requirePage } from "@/lib/session";
import { listAudit, resolveTargets } from "@/lib/queries/admin";
import { AUDIT_ACTION_LABEL, formatDateTime } from "@/lib/labels";
import { EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { SelectFilter } from "@/components/SelectFilter";
import { Pager } from "@/components/Pager";

const GROUPS = [
  { key: "course", label: "프로그램" },
  { key: "banner", label: "배너" },
  { key: "category", label: "카테고리" },
  { key: "provider", label: "제공기관" },
  { key: "user", label: "회원" },
  { key: "partner", label: "파트너" },
  { key: "review", label: "후기" },
  { key: "session", label: "실습 일정" },
  { key: "page", label: "문서" },
  { key: "organization", label: "기관" },
];

function summarize(detail: unknown): string {
  if (!detail || typeof detail !== "object") return "";
  const d = detail as Record<string, unknown>;
  const parts: string[] = [];
  if (d.from !== undefined && d.to !== undefined) parts.push(`${String(d.from)} → ${String(d.to)}`);
  else if (d.to !== undefined) parts.push(`→ ${String(d.to)}`);
  if (typeof d.op === "string") parts.push(d.op);
  if (typeof d.note === "string" && d.note) parts.push(`“${d.note}”`);
  return parts.join(" · ");
}

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ action?: string; actor?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  await requirePage("audit", locale);
  const sp = await searchParams;
  const data = await listAudit({ ...sp, page: Number(sp.page) || 1 });
  const names = await resolveTargets(data.rows.map((r) => r.target));
  const base = `/${locale}/audit`;
  const link = (action?: string) => qs(base, { action, actor: sp.actor, q: sp.q });

  return (
    <>
      <PageHeader title="감사 로그" description="프로그램 상태 전이, 공개범위·큐레이션 변경, 가입 승인, 역할 변경 등 모든 운영 변경 기록입니다." />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox placeholder="대상 ID 검색 (예: Course:…)" />
        <SelectFilter
          param="actor"
          label="처리자"
          value={sp.actor ?? ""}
          options={[{ value: "", label: "모든 처리자" }, ...data.actors.map((a) => ({ value: a.id, label: a.name ?? a.email }))]}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip href={link()} active={!sp.action}>
          전체
        </FilterChip>
        {GROUPS.map((g) => (
          <FilterChip key={g.key} href={link(g.key)} active={sp.action === g.key}>
            {g.label}
          </FilterChip>
        ))}
      </div>

      <div className={cx(tableWrap, "max-h-[calc(100vh-280px)]")}>
        {data.rows.length === 0 ? (
          <EmptyState title="기록이 없습니다" description="어드민에서 변경이 일어나면 여기에 쌓입니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>시각</th>
                <th className={thClass}>처리자</th>
                <th className={thClass}>작업</th>
                <th className={thClass}>대상</th>
                <th className={thClass}>내용</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const [type, id] = r.target.split(":");
                const href = type === "Course" ? `/${locale}/programs/${id}` : type === "User" ? `/${locale}/members/${id}` : null;
                const name = names.get(r.target);
                return (
                  <tr key={r.id} className={trClass}>
                    <td className={cx(tdClass, "tabular text-subtle")}>{formatDateTime(r.at)}</td>
                    <td className={tdClass}>{r.actor?.name ?? r.actor?.email ?? "시스템"}</td>
                    <td className={tdClass}>
                      <span className="font-medium">{AUDIT_ACTION_LABEL[r.action] ?? r.action}</span>
                      <span className="ml-1.5 font-mono text-micro text-subtle">{r.action}</span>
                    </td>
                    <td className={cx(tdClass, "max-w-[280px] truncate")}>
                      {href && name ? (
                        <Link href={href} className="hover:underline">
                          {name}
                        </Link>
                      ) : (
                        <span className="text-subtle">{name ?? r.target}</span>
                      )}
                    </td>
                    <td className={cx(tdClass, "max-w-[320px] truncate text-caption text-muted")} title={summarize(r.detail)}>
                      {summarize(r.detail)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={data.page} pages={data.pages} total={data.total} />
    </>
  );
}
