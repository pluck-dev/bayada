import Link from "next/link";
import { BOOKING_MAX_DAYS_AHEAD, CANCEL_BEFORE_HOURS } from "@bayada/shared/member";
import { kstDate } from "@bayada/shared/web-content";
import { requireMember, linkedPatients } from "@/lib/member/session";
import { BookingForm } from "@/components/member/BookingForm";
import { Card, Notice, PageTitle } from "@/components/member/ui";

export default async function NewBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/bookings/new");
  const type = m.webMemberProfile.memberType;
  const base = `/${locale}/my-page`;
  if (type !== "SERVICE_USER" && type !== "GUARDIAN") return <Notice>서비스 예약은 서비스 이용자·보호자 회원이 이용해요.</Notice>;
  const links = type === "GUARDIAN" ? await linkedPatients(m.id) : [];
  if (type === "GUARDIAN" && links.length === 0) {
    return (
      <Notice tone="blue">
        가족을 대신해 예약하려면 먼저{" "}
        <Link href={`${base}/family`} className="font-semibold underline">
          가족 연결
        </Link>
        을 해 주세요.
      </Notice>
    );
  }
  const now = Date.now();
  return (
    <>
      <PageTitle title="새 예약 신청" description="신청하면 운영팀이 일정과 담당자를 확인해 확정 안내를 드려요." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <BookingForm
            locale={locale}
            patients={type === "GUARDIAN" ? links.map((l) => ({ id: l.patient.id, label: `${l.patient.name ?? l.patient.email} (${l.relationship})` })) : undefined}
            defaults={{ patientId: links.length === 1 ? links[0].patient.id : undefined, address: m.webMemberProfile.address ?? "" }}
            minDate={kstDate(new Date(now + 86400_000))}
            maxDate={kstDate(new Date(now + BOOKING_MAX_DAYS_AHEAD * 86400_000))}
          />
        </Card>
        <aside className="flex flex-col gap-3 self-start rounded-2xl bg-white p-5 text-sm leading-relaxed text-[color:var(--muted)] shadow-[inset_0_0_0_1px_var(--border)]">
          <p className="font-bold text-[color:var(--fg)]">예약 진행 순서</p>
          <ol className="flex list-decimal flex-col gap-1.5 pl-4">
            <li>신청 접수 — 확정 전까지 내용 변경·취소 가능</li>
            <li>예약 확정 — 방문 시각·담당자 안내</li>
            <li>방문 완료 — 방문 기록 열람·만족도 평가</li>
          </ol>
          <p>확정된 예약은 방문 {CANCEL_BEFORE_HOURS}시간 전까지 온라인으로 취소할 수 있어요. 급한 변경은 1670-1379 로 연락해 주세요.</p>
        </aside>
      </div>
    </>
  );
}
