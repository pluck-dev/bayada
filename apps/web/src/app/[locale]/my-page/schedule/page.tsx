import Link from "next/link";
import { prisma } from "@bayada/db";
import { TIME_SLOT_SHORT, kstToday, serviceName, ymd } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { Badge, Card, EmptyState, Notice, PageTitle, fmtDay } from "@/components/member/ui";

export default async function SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/schedule");
  const p = m.webMemberProfile;
  if (p.memberType !== "PROVIDER") return <Notice>방문 일정은 제공자 회원 화면이에요.</Notice>;
  const base = `/${locale}/my-page/schedule`;
  if (!p.isVisitStaff) {
    return (
      <>
        <PageTitle title="방문 일정" />
        <EmptyState
          title="아직 방문 인력으로 지정되지 않았어요"
          description="바야다 운영팀이 자격 확인 후 방문 인력으로 지정하면, 배정된 방문 일정과 방문 기록 작성이 여기에 열려요. 의료 전문인력 지원서를 아직 내지 않았다면 먼저 지원해 주세요."
          action={
            <Link href={`/${locale}/who-we-serve/providers/healthcare-professionals`} className="text-sm font-semibold text-[#ce0e2d] hover:underline">
              전문인력 지원 안내 보기
            </Link>
          }
        />
      </>
    );
  }
  const rows = await prisma.booking.findMany({
    where: { assignedStaffId: m.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
    orderBy: [{ scheduledDate: "asc" }, { timeSlot: "asc" }],
    take: 200,
    select: { id: true, bookingNumber: true, serviceType: true, scheduledDate: true, timeSlot: true, scheduledTime: true, status: true, address: true, patient: { select: { name: true } } },
  });
  const today = kstToday();
  const toWrite = rows.filter((b) => b.status === "CONFIRMED" && ymd(b.scheduledDate) <= today);
  const upcoming = rows.filter((b) => b.status === "CONFIRMED" && ymd(b.scheduledDate) > today);
  const done = rows.filter((b) => b.status === "COMPLETED").reverse().slice(0, 20);

  const List = ({ items, cta }: { items: typeof rows; cta?: string }) => (
    <ul className="divide-y divide-gray-100">
      {items.map((b) => (
        <li key={b.id}>
          <Link href={`${base}/${b.id}`} className="flex items-center gap-4 py-3.5 hover:opacity-80">
            <span className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-[#f0f4f7] py-2">
              <span className="text-[11px] font-semibold text-[color:var(--muted)]">{b.scheduledTime ?? TIME_SLOT_SHORT[b.timeSlot]}</span>
              <span className="text-sm font-bold">{fmtDay(b.scheduledDate).replace(/^\d+년\s*/, "").replace(/\s*\(.+\)$/, "")}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">
                {b.patient.name ?? "이용자"} · {serviceName(b.serviceType)}
              </span>
              <span className="block truncate text-sm text-[color:var(--muted)]">{b.address}</span>
            </span>
            {cta ? <Badge tone="red">{cta}</Badge> : b.status === "COMPLETED" ? <Badge tone="green">기록 완료</Badge> : <Badge tone="blue">예정</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="방문 일정" description="나에게 배정된 방문이에요. 방문을 마치면 당일 안에 방문 기록을 남겨 주세요." />
      {toWrite.length > 0 && (
        <Card title={`방문 기록 작성 필요 ${toWrite.length}건`}>
          <List items={toWrite} cta="기록 작성" />
        </Card>
      )}
      <Card title={`다가오는 방문 ${upcoming.length}건`}>{upcoming.length ? <List items={upcoming} /> : <EmptyState title="예정된 방문이 없어요" />}</Card>
      <Card title="최근 완료한 방문">{done.length ? <List items={done} /> : <EmptyState title="완료한 방문이 없어요" />}</Card>
    </div>
  );
}
