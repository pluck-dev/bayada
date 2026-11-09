"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { WEB_INQUIRY_STATUSES, WEB_INQUIRY_STATUS_LABEL } from "@bayada/shared/web-content";
import { addInquiryNote, deleteInquiry, setInquiryAssignee, setInquiryStatus } from "@/lib/actions/web-inquiries";
import { Button, Card, Field, Select, cx, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function InquiryControls({
  locale,
  id,
  referenceNo,
  status,
  assigneeId,
  assignees,
  contact,
}: {
  locale: string;
  id: string;
  referenceNo: string;
  status: string;
  assigneeId: string | null;
  assignees: { id: string; label: string }[];
  contact: { name: string | null; phone: string | null; email: string | null; organization: string | null };
}) {
  const { run, isPending } = useAction();
  const router = useRouter();

  return (
    <div data-tour="inquiry-controls" className="flex flex-col gap-4">
      <Card title="연락처">
        <dl className="grid grid-cols-[64px_minmax(0,1fr)] gap-y-1.5 text-caption">
          <dt className="text-muted">이름</dt>
          <dd className="font-medium">{contact.name ?? "-"}</dd>
          {contact.organization && (
            <>
              <dt className="text-muted">기관</dt>
              <dd>{contact.organization}</dd>
            </>
          )}
          <dt className="text-muted">전화</dt>
          <dd className="tabular">{contact.phone ? <a href={`tel:${contact.phone}`} className="transition-colors hover:text-brand">{contact.phone}</a> : "-"}</dd>
          <dt className="text-muted">이메일</dt>
          <dd className="break-all">{contact.email ? <a href={`mailto:${contact.email}`} className="transition-colors hover:text-brand">{contact.email}</a> : "-"}</dd>
        </dl>
      </Card>

      <Card title="처리">
        <fieldset disabled={isPending} className="flex flex-col gap-3">
          <Field label="상태" htmlFor="inq-status">
            <Select
              id="inq-status"
              value={status}
              disabled={isPending}
              onChange={(x) => run(() => setInquiryStatus(id, x))}
              options={WEB_INQUIRY_STATUSES.map((s) => ({ value: s, label: WEB_INQUIRY_STATUS_LABEL[s] }))}
            />
          </Field>
          <Field label="담당자" htmlFor="inq-assignee">
            <Select
              id="inq-assignee"
              value={assigneeId ?? ""}
              disabled={isPending}
              onChange={(x) => run(() => setInquiryAssignee(id, x || null))}
              options={[{ value: "", label: "지정 안 함" }, ...assignees.map((u) => ({ value: u.id, label: u.label }))]}
            />
          </Field>
        </fieldset>
        <div className="mt-4 border-t border-line pt-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() =>
              run(() => deleteInquiry(id), {
                confirm: {
                  title: `${referenceNo} 문의를 삭제할까요?`,
                  body: "신청 내용과 처리 이력이 모두 지워지고 되돌릴 수 없습니다. 개인정보 파기 요청 등에만 쓰세요.",
                  confirmLabel: "삭제",
                  danger: true,
                },
                refresh: false,
                onSuccess: () => router.push(`/${locale}/web/inquiries`),
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            문의 삭제
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function InquiryNoteForm({ id }: { id: string }) {
  const { run, isPending } = useAction();
  const [body, setBody] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addInquiryNote(id, body), { onSuccess: () => setBody("") });
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        aria-label="메모"
        rows={3}
        maxLength={2000}
        placeholder="통화 내용, 다음 연락 예정 등 내부 메모 (신청자에게 보이지 않습니다)"
        className={cx(textareaClass)}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="primary" disabled={isPending || !body.trim()}>
          메모 남기기
        </Button>
      </div>
    </form>
  );
}
