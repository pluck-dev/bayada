import Link from "next/link";
import { WEB_INQUIRY_STATUS_LABEL, webFormLabel } from "@bayada/shared/web-content";
import { requireMember } from "@/lib/member/session";
import { listMemberInquiries } from "@/lib/member/queries";
import { INQUIRY_TONE, Badge, EmptyState, Notice, PageTitle, btnClass, fmtDateTime } from "@/components/member/ui";

export default async function InquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/inquiries");
  const rows = await listMemberInquiries(m);
  const base = `/${locale}/my-page`;
  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="상담·문의 내역"
        description="홈페이지에서 남긴 상담 신청·자격 신청·지원서의 처리 상황이에요. 담당자가 상태를 바꾸면 바로 반영돼요."
        action={
          <Link href={`/${locale}/contact`} className={btnClass("outline")}>
            새 상담 신청
          </Link>
        }
      />
      {!m.emailVerifiedAt && (
        <Notice tone="amber">로그인하지 않고 남긴 문의는 이메일 인증 후 함께 보여요 (마이페이지 홈의 &lsquo;인증 메일 보내기&rsquo;).</Notice>
      )}
      {rows.length === 0 ? (
        <EmptyState title="아직 남긴 상담·문의가 없어요" description="로그인한 채로 상담을 신청하면 여기서 처리 상황을 볼 수 있어요." />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((q) => (
            <li key={q.id}>
              <Link href={`${base}/inquiries/${q.id}`} className="flex flex-col gap-2 rounded-2xl border border-[color:var(--border)] bg-white p-4 transition-colors hover:border-gray-400 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <p className="text-[16px] font-bold">{webFormLabel(q.formType)}</p>
                  <p className="mt-0.5 text-sm tabular-nums text-[color:var(--muted)]">
                    {q.referenceNo} · {fmtDateTime(q.createdAt)} 접수
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {q.notes[0] && <span className="text-xs text-gray-400">{fmtDateTime(q.notes[0].createdAt)} 업데이트</span>}
                  <Badge tone={INQUIRY_TONE[q.status]} dot>
                    {WEB_INQUIRY_STATUS_LABEL[q.status]}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
