import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKING_STATUS_LABEL, FAMILY_LINK_STATUS_LABEL, MEMBER_TYPE_LABEL, TIME_SLOT_SHORT, serviceName } from "@bayada/shared/member";
import { WEB_INQUIRY_STATUS_LABEL, webFormLabel } from "@bayada/shared/web-content";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getWebMember } from "@/lib/queries/web-members";
import { formatDateTime } from "@/lib/labels";
import { BOOKING_STATUS_TONE, INQUIRY_STATUS_TONE, MEMBER_TYPE_TONE } from "@/lib/web-labels";
import { Badge, Card, DescList, EmptyState, Notice, PageHeader } from "@/components/ui";
import { MemberControls } from "@/components/web/MemberControls";

const dayLabel = (d: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "2-digit", day: "2-digit", weekday: "short" }).format(d);

export default async function WebMemberDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("web.members", locale);
  const m = await getWebMember(id);
  if (!m || !m.webMemberProfile) notFound();
  const p = m.webMemberProfile;
  const bookingsLink = can(user, "web.bookings");
  const inquiryLink = can(user, "web.inquiries");
  const bookings = p.memberType === "PROVIDER" ? m.bookingsAssigned : m.bookingsAsPatient;
  const links = [
    ...m.familyLinksAsGuardian.map((l) => ({ id: l.id, status: l.status, relationship: l.relationship, other: l.patient, role: "이용자" })),
    ...m.familyLinksAsPatient.map((l) => ({ id: l.id, status: l.status, relationship: l.relationship, other: l.guardian, role: "보호자" })),
  ];

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/web/members`, label: "홈페이지 회원" }}
        title={
          <span className="flex items-center gap-2">
            {m.name ?? "-"}
            <Badge tone={MEMBER_TYPE_TONE[p.memberType]}>{MEMBER_TYPE_LABEL[p.memberType]}</Badge>
            {p.isVisitStaff && <Badge tone="brand">방문 인력</Badge>}
          </span>
        }
        description={`${m.email} · ${formatDateTime(p.createdAt)} 홈페이지 회원 시작`}
      />
      {p.withdrawnAt && <Notice className="mb-4">{formatDateTime(p.withdrawnAt)} 탈퇴 처리된 계정입니다 (개인정보 파기·익명화 완료).</Notice>}
      {!p.withdrawnAt && p.withdrawalRequestedAt && (
        <Notice tone="danger" className="mb-4">
          {formatDateTime(p.withdrawalRequestedAt)} 탈퇴 요청 {p.withdrawalReason ? `· 사유: ${p.withdrawalReason}` : ""}
        </Notice>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card tour="member-profile" title="회원 정보">
            <DescList
              items={[
                { label: "휴대폰", value: <span className="tabular">{m.phone ?? "-"}</span> },
                { label: "이메일 인증", value: m.emailVerifiedAt ? formatDateTime(m.emailVerifiedAt) : "미인증" },
                ...(p.providerRole ? [{ label: "직군", value: p.providerRole }] : []),
                ...(p.orgName ? [{ label: "기관", value: `${p.orgName} · ${p.orgType ?? ""}` }] : []),
                ...(p.address ? [{ label: "기본 주소", value: <span className="whitespace-normal">{p.address}</span> }] : []),
                { label: "알림 수신", value: `이메일 ${p.emailOptIn ? "동의" : "거부"} · 문자 ${p.smsOptIn ? "동의" : "거부"}` },
                { label: "아카데미", value: `수강 ${m._count.enrollments} · 수료 ${m._count.certificates}${m.organization ? ` · ${m.organization.name}` : ""}` },
                ...(p.memberType === "SERVICE_USER" ? [{ label: "건강·복약 기록", value: `건강 기록 ${m._count.healthRecords}건 · 약 ${m._count.medications}개 (내용은 회원·보호자만 열람)` }] : []),
              ]}
            />
          </Card>

          <Card title={p.memberType === "PROVIDER" ? `담당 예약 ${bookings.length}건` : `서비스 예약 ${bookings.length}건`} padded={false}>
            {bookings.length === 0 ? (
              <EmptyState title="예약이 없습니다" />
            ) : (
              <ul className="divide-y divide-hairline">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link href={bookingsLink ? `/${locale}/web/bookings/${b.id}` : "#"} className="flex items-center gap-3 px-4 py-2.5 text-caption hover:bg-surface">
                      <Badge tone={BOOKING_STATUS_TONE[b.status]} dot>
                        {BOOKING_STATUS_LABEL[b.status]}
                      </Badge>
                      <span className="flex-1 truncate">
                        <span className="font-medium">{serviceName(b.serviceType)}</span>
                        <span className="ml-2 text-subtle">{p.memberType === "PROVIDER" ? b.patient.name : b.assignedStaff?.name}</span>
                      </span>
                      <span className="tabular shrink-0 text-subtle">
                        {dayLabel(b.scheduledDate)} {TIME_SLOT_SHORT[b.timeSlot]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`문의 ${m.webInquiries.length}건`} padded={false}>
            {m.webInquiries.length === 0 ? (
              <EmptyState title="로그인 상태로 남긴 문의가 없습니다" />
            ) : (
              <ul className="divide-y divide-hairline">
                {m.webInquiries.map((q) => (
                  <li key={q.id}>
                    <Link href={inquiryLink ? `/${locale}/web/inquiries/${q.id}` : "#"} className="flex items-center gap-3 px-4 py-2.5 text-caption hover:bg-surface">
                      <Badge tone={INQUIRY_STATUS_TONE[q.status]} dot>
                        {WEB_INQUIRY_STATUS_LABEL[q.status]}
                      </Badge>
                      <span className="flex-1 truncate">
                        <span className="tabular font-medium">{q.referenceNo}</span>
                        <span className="ml-2 text-subtle">{webFormLabel(q.formType)}</span>
                      </span>
                      <span className="tabular shrink-0 text-subtle">{formatDateTime(q.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {links.length > 0 && (
            <Card title="가족 연결">
              <DescList
                items={links.map((l) => ({
                  label: `${l.role} · ${l.relationship}`,
                  value: (
                    <span>
                      <Link href={`/${locale}/web/members/${l.other.id}`} className="hover:text-brand">
                        {l.other.name ?? l.other.email}
                      </Link>{" "}
                      <span className="font-normal text-muted">({FAMILY_LINK_STATUS_LABEL[l.status]})</span>
                    </span>
                  ),
                }))}
              />
            </Card>
          )}
        </div>

        {!p.withdrawnAt && (
          <MemberControls
            userId={m.id}
            name={m.name ?? m.email}
            memberType={p.memberType}
            isVisitStaff={p.isVisitStaff}
            withdrawalRequested={!!p.withdrawalRequestedAt}
          />
        )}
      </div>
    </>
  );
}
