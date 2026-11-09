import Link from "next/link";
import { Download } from "lucide-react";
import {
  WEB_FORM_TYPES,
  WEB_FORM_TYPE_KEYS,
  WEB_INQUIRY_STATUSES,
  WEB_INQUIRY_STATUS_LABEL,
  webFormLabel,
} from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { listInquiries, parseInquiryFilter } from "@/lib/queries/web";
import { formatDateTime } from "@/lib/labels";
import { INQUIRY_STATUS_TONE } from "@/lib/web-labels";
import { Pager } from "@/components/Pager";
import { SearchBox } from "@/components/SearchBox";
import { SelectFilter } from "@/components/SelectFilter";
import {
  Badge,
  Button,
  DatePicker,
  EmptyState,
  FilterChip,
  PageHeader,
  buttonClass,
  cx,
  qs,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";

type SP = { type?: string; status?: string; from?: string; to?: string; q?: string; page?: string };

export default async function WebInquiriesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  await requirePage("web.inquiries", locale);
  const sp = await searchParams;
  const f = parseInquiryFilter(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages, statusCounts } = await listInquiries(f, page);
  const base = `/${locale}/web/inquiries`;
  const keep = { type: f.type, from: f.from, to: f.to, q: f.q };
  const allCount = Object.values(statusCounts).reduce((n, c) => n + (c ?? 0), 0);
  const exportHref = qs("/api/v1/web/inquiries/export", { ...keep, status: f.status });
  // 접두어가 같은 폼(CS)이 있어 유형 필터는 폼 종류로
  const typeOptions = [
    { value: "", label: "모든 유형" },
    ...WEB_FORM_TYPE_KEYS.map((k) => ({ value: k, label: `${WEB_FORM_TYPES[k].label} (${WEB_FORM_TYPES[k].prefix})` })),
  ];

  return (
    <>
      <PageHeader
        title="문의 CRM"
        description="홈페이지에서 접수된 상담·신청 문의입니다. 상태·담당자·메모로 처리 이력을 남기고, 현재 필터 그대로 CSV 로 내려받을 수 있습니다."
        actions={
          <a href={exportHref} className={buttonClass("secondary")}>
            <Download className="h-3.5 w-3.5" aria-hidden />
            CSV 내려받기
          </a>
        }
      />

      <div data-tour="inquiry-status" className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="상태">
        <FilterChip href={qs(base, keep)} active={!f.status} count={allCount}>
          전체
        </FilterChip>
        {WEB_INQUIRY_STATUSES.map((s) => (
          <FilterChip key={s} href={qs(base, { ...keep, status: s })} active={f.status === s} count={statusCounts[s] ?? 0}>
            {WEB_INQUIRY_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <div data-tour="inquiry-filters" className="mb-4 flex flex-wrap items-center gap-2">
        <SelectFilter param="type" label="문의 유형" value={f.type ?? ""} options={typeOptions} />
        {/* 기간: GET 폼 — 다른 필터는 hidden 으로 유지 */}
        <form className="flex items-center gap-1.5" action={base}>
          {f.type && <input type="hidden" name="type" value={f.type} />}
          {f.status && <input type="hidden" name="status" value={f.status} />}
          {f.q && <input type="hidden" name="q" value={f.q} />}
          <DatePicker size="sm" name="from" aria-label="접수일 시작" placeholder="시작일" defaultValue={f.from} />
          <span className="text-caption text-subtle">~</span>
          <DatePicker size="sm" name="to" aria-label="접수일 끝" placeholder="종료일" defaultValue={f.to} />
          <Button type="submit" size="sm" variant="primary" className="h-9 px-4">
            기간 적용
          </Button>
          {(f.from || f.to) && (
            <Link href={qs(base, { type: f.type, status: f.status, q: f.q })} className="text-caption text-muted hover:text-ink">
              기간 해제
            </Link>
          )}
        </form>
        <div className="ml-auto">
          <SearchBox placeholder="이름·연락처·이메일·기관·접수번호" />
        </div>
      </div>

      <div data-tour="inquiry-table" className={tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title={allCount === 0 && !f.q && !f.type && !f.from && !f.to ? "아직 접수된 문의가 없습니다" : "조건에 맞는 문의가 없습니다"}
            description="홈페이지 상담 신청·파트너 자격 신청·DeiCloud 사전 신청이 여기에 쌓입니다."
          />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>접수번호</th>
                <th className={thClass}>유형</th>
                <th className={thClass}>신청자</th>
                <th className={thClass}>연락처</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>담당자</th>
                <th className={thClass}>접수 일시</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={trClass}>
                  <td className={cx(tdClass, "tabular")}>
                    <Link href={`${base}/${r.id}`} className="font-bold text-ink transition-colors hover:text-brand">
                      {r.referenceNo}
                    </Link>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{webFormLabel(r.formType)}</td>
                  <td className={tdClass}>
                    <span className="font-medium">{r.name ?? "-"}</span>
                    {r.organization && r.organization !== r.name && <p className="text-micro text-subtle">{r.organization}</p>}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>
                    <p className="tabular">{r.phone ?? "-"}</p>
                    {r.email && <p className="text-micro text-subtle">{r.email}</p>}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={INQUIRY_STATUS_TONE[r.status]} dot>
                      {WEB_INQUIRY_STATUS_LABEL[r.status]}
                    </Badge>
                    {r._count.notes > 0 && <span className="ml-1.5 text-micro text-subtle">이력 {r._count.notes}</span>}
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{r.assignee ? (r.assignee.name ?? r.assignee.email) : "-"}</td>
                  <td className={cx(tdClass, "tabular text-muted")}>{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pager page={page} pages={pages} total={total} />
    </>
  );
}
