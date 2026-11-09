import Link from "next/link";
import { serviceName } from "@bayada/shared/member";
import { requireMember, linkedPatients } from "@/lib/member/session";
import { listVisits } from "@/lib/member/queries";
import { VisitReport } from "@/components/member/VisitReport";
import { Card, EmptyState, Notice, PageTitle, TextLink } from "@/components/member/ui";

export default async function VisitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/visits");
  const type = m.webMemberProfile.memberType;
  if (type !== "SERVICE_USER" && type !== "GUARDIAN") return <Notice>방문 기록은 서비스 이용자·보호자 회원이 열람해요. 제공자는 &lsquo;방문 일정&rsquo;에서 기록을 써요.</Notice>;
  const links = type === "GUARDIAN" ? await linkedPatients(m.id) : [];
  const ids = type === "GUARDIAN" ? links.map((l) => l.patient.id) : [m.id];
  const visits = ids.length ? await listVisits(ids) : [];
  const base = `/${locale}/my-page`;
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="방문 기록" description="간호사·요양보호사가 방문 후 남긴 기록이에요. 기록은 담당자만 쓸 수 있고, 여기서는 열람만 해요." />
      {visits.length === 0 ? (
        <EmptyState title="아직 방문 기록이 없어요" description="방문이 끝나면 담당자가 남긴 기록이 여기에 쌓여요." />
      ) : (
        visits.map((v) => (
          <Card
            key={v.id}
            title={`${serviceName(v.booking.serviceType)}${type === "GUARDIAN" && v.patient.name ? ` · ${v.patient.name}` : ""}`}
            description={v.booking.bookingNumber}
            action={<TextLink href={`${base}/bookings/${v.booking.id}`}>{v.booking.rating ? "예약 보기" : "평가 남기기"}</TextLink>}
          >
            <VisitReport visit={v} />
          </Card>
        ))
      )}
      {type === "GUARDIAN" && ids.length === 0 && (
        <Notice tone="blue">
          <Link href={`${base}/family`} className="font-semibold underline">
            가족 연결
          </Link>
          이 승인되면 가족의 방문 기록을 볼 수 있어요.
        </Notice>
      )}
    </div>
  );
}
