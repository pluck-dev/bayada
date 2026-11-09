import { notFound } from "next/navigation";
import {
  WEB_FIELD_LABEL,
  WEB_INQUIRY_STATUS_LABEL,
  formatWebFieldValue,
  webFormLabel,
} from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { getInquiry, listAssignees } from "@/lib/queries/web";
import { formatDateTime } from "@/lib/labels";
import { INQUIRY_STATUS_TONE } from "@/lib/web-labels";
import { Badge, Card, PageHeader } from "@/components/ui";
import { InquiryControls, InquiryNoteForm } from "@/components/web/InquiryControls";

const NOTE_KIND_LABEL: Record<string, string> = { memo: "메모", status: "상태", assignee: "담당자" };

export default async function WebInquiryDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requirePage("web.inquiries", locale);
  const [inq, assignees] = await Promise.all([getInquiry(id), listAssignees()]);
  if (!inq) notFound();
  const payload = (inq.payload && typeof inq.payload === "object" && !Array.isArray(inq.payload) ? inq.payload : {}) as Record<string, unknown>;
  const fields = Object.entries(payload).filter(([, v]) => formatWebFieldValue("", v) !== "");

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/web/inquiries`, label: "문의 CRM" }}
        title={
          <span className="flex items-center gap-2">
            <span className="tabular">{inq.referenceNo}</span>
            <Badge tone={INQUIRY_STATUS_TONE[inq.status]} dot>
              {WEB_INQUIRY_STATUS_LABEL[inq.status]}
            </Badge>
          </span>
        }
        description={`${webFormLabel(inq.formType)} · ${formatDateTime(inq.createdAt)} 접수`}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-4">
        <div className="flex flex-col gap-4">
          <Card tour="inquiry-content" title="신청 내용">
            <dl className="grid grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-caption">
              {fields.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{WEB_FIELD_LABEL[k] ?? k}</dt>
                  <dd className="whitespace-pre-line break-words text-ink">{formatWebFieldValue(k, v)}</dd>
                </div>
              ))}
              <dt className="text-muted">개인정보 동의</dt>
              <dd>{inq.privacyConsent ? "동의함" : "해당 없음 / 동의 안 함"}</dd>
              <dt className="text-muted">접수 페이지</dt>
              <dd className="text-muted">{inq.sourcePage ?? "-"}</dd>
            </dl>
          </Card>

          <Card tour="inquiry-history" title={`처리 이력 · ${inq.notes.length}건`}>
            <InquiryNoteForm id={inq.id} />
            {inq.notes.length > 0 && (
              <ol className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
                {inq.notes.map((n) => (
                  <li key={n.id} className="text-caption">
                    <div className="flex items-center gap-2 text-subtle">
                      <Badge tone={n.kind === "memo" ? "zinc" : "blue"}>{NOTE_KIND_LABEL[n.kind] ?? n.kind}</Badge>
                      <span>{n.author ? (n.author.name ?? n.author.email) : "(삭제된 계정)"}</span>
                      <span className="tabular">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-ink">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <InquiryControls
          locale={locale}
          id={inq.id}
          referenceNo={inq.referenceNo}
          status={inq.status}
          assigneeId={inq.assignee?.id ?? null}
          assignees={assignees.map((u) => ({ id: u.id, label: u.name ? `${u.name} (${u.email})` : u.email }))}
          contact={{ name: inq.name, phone: inq.phone, email: inq.email, organization: inq.organization }}
        />
      </div>
    </>
  );
}
