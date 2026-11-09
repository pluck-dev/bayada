import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { WEB_FIELD_LABEL, WEB_INQUIRY_STATUSES, WEB_INQUIRY_STATUS_LABEL, formatWebFieldValue, webFormLabel } from "@bayada/shared/web-content";
import { requireMember } from "@/lib/member/session";
import { listMemberInquiries } from "@/lib/member/queries";
import { Card, INQUIRY_TONE, Badge, InfoList, Timeline, fmtDateTime } from "@/components/member/ui";

// 처리 단계 표시(스팸 제외) — 상태 이력은 어드민 CRM 의 '상태' 기록만 보여 준다(내부 메모·담당자 변경은 숨김)
const STEPS = WEB_INQUIRY_STATUSES.filter((s) => s !== "SPAM");

export default async function InquiryDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const m = await requireMember(locale, `/my-page/inquiries/${id}`);
  // 같은 접근 규칙(내 계정 또는 인증된 같은 이메일)으로 찾는다
  const q = (await listMemberInquiries(m)).find((x) => x.id === id);
  if (!q) notFound();
  const payload = (q.payload && typeof q.payload === "object" && !Array.isArray(q.payload) ? q.payload : {}) as Record<string, unknown>;
  const fields = Object.entries(payload).filter(([, v]) => formatWebFieldValue("", v) !== "");
  const idx = STEPS.indexOf(q.status as (typeof STEPS)[number]);
  const history = [
    ...q.notes.map((n) => ({ id: n.id, title: n.body.split("→").pop()?.trim() ?? n.body, body: undefined, at: fmtDateTime(n.createdAt) })),
    { id: "created", title: "접수", body: `접수번호 ${q.referenceNo}`, at: fmtDateTime(q.createdAt) },
  ].map((h, i) => ({ ...h, current: i === 0 }));

  return (
    <div className="flex flex-col gap-5">
      <Link href={`/${locale}/my-page/inquiries`} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--fg)]">
        <ChevronLeft className="size-4" aria-hidden />
        상담·문의 내역
      </Link>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={INQUIRY_TONE[q.status]} dot>
            {WEB_INQUIRY_STATUS_LABEL[q.status]}
          </Badge>
          <span className="text-sm tabular-nums text-gray-400">{q.referenceNo}</span>
        </div>
        <h1 className="mt-3 text-[24px] font-bold tracking-tight">{webFormLabel(q.formType)}</h1>
        {idx >= 0 && (
          <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="처리 단계">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-col gap-2">
                <span className={`h-1.5 rounded-full ${i <= idx ? "bg-[#ce0e2d]" : "bg-gray-200"}`} />
                <span className={`text-xs font-semibold sm:text-sm ${i <= idx ? "text-[color:var(--fg)]" : "text-gray-400"}`}>{WEB_INQUIRY_STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="신청 내용">
          <InfoList items={fields.map(([k, v]) => [WEB_FIELD_LABEL[k] ?? k, <span key={k} className="whitespace-pre-line">{formatWebFieldValue(k, v)}</span>])} />
        </Card>
        <Card title="처리 이력" className="self-start">
          <Timeline items={history} />
        </Card>
      </div>
    </div>
  );
}
