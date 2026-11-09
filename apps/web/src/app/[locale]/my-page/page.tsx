import Link from "next/link";
import { ArrowRight, CalendarCheck, ExternalLink, Pill } from "lucide-react";
import { prisma } from "@bayada/db";
import { BOOKING_STATUS_LABEL, TIME_SLOT_SHORT, dateOnly, kstToday, serviceName } from "@bayada/shared/member";
import { WEB_INQUIRY_STATUS_LABEL, webFormLabel } from "@bayada/shared/web-content";
import { requireMember, linkedPatients } from "@/lib/member/session";
import { academySummary, listHealthRecords, listMemberInquiries, todayMedications } from "@/lib/member/queries";
import { ACADEMY_URL } from "@/lib/app-url";
import { BOOKING_TONE, Badge, Card, EmptyState, INQUIRY_TONE, Notice, TextLink, btnClass, fmtDate, fmtDateTime, fmtDayShort } from "@/components/member/ui";
import { VerifyEmailBanner } from "@/components/member/VerifyEmailBanner";

export default async function MyPageHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale);
  const base = `/${locale}/my-page`;
  const type = m.webMemberProfile.memberType;
  const inquiries = await listMemberInquiries(m);

  return (
    <div className="flex flex-col gap-5">
      {!m.emailVerifiedAt && <VerifyEmailBanner locale={locale} email={m.email} />}
      {m.webMemberProfile.withdrawalRequestedAt && (
        <Notice tone="amber">
          회원 탈퇴를 요청했어요 ({fmtDate(m.webMemberProfile.withdrawalRequestedAt)}). 처리 전까지는 그대로 이용할 수 있고{" "}
          <Link href={`${base}/settings#withdrawal`} className="font-semibold underline">
            설정
          </Link>
          에서 요청을 취소할 수 있어요.
        </Notice>
      )}

      {type === "SERVICE_USER" && <ServiceUserHome base={base} userId={m.id} />}
      {type === "GUARDIAN" && <GuardianHome base={base} userId={m.id} />}
      {type === "PROVIDER" && <ProviderHome base={base} userId={m.id} isStaff={m.webMemberProfile.isVisitStaff} />}
      {type === "ORGANIZATION" && <OrganizationHome base={base} m={m} inquiries={inquiries} />}

      <Card title="최근 상담·문의" action={<TextLink href={`${base}/inquiries`}>전체 보기</TextLink>}>
        {inquiries.length === 0 ? (
          <EmptyState
            title="아직 남긴 상담·문의가 없어요"
            description="로그인한 채로 상담을 신청하면 처리 상황을 여기서 볼 수 있어요."
            action={
              <Link href={`/${locale}/contact`} className={btnClass("outline", "sm")}>
                상담 신청하기
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.slice(0, 3).map((q) => (
              <li key={q.id}>
                <Link href={`${base}/inquiries/${q.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[color:var(--fg)]">{webFormLabel(q.formType)}</p>
                    <p className="text-xs tabular-nums text-[color:var(--muted)]">
                      {q.referenceNo} · {fmtDateTime(q.createdAt)}
                    </p>
                  </div>
                  <Badge tone={INQUIRY_TONE[q.status]} dot>
                    {WEB_INQUIRY_STATUS_LABEL[q.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatTile({ label, value, sub, href }: { label: string; value: React.ReactNode; sub?: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group flex flex-col rounded-2xl border border-[color:var(--border)] bg-white p-5 transition-colors hover:border-gray-400">
      <span className="text-sm font-semibold text-[color:var(--muted)]">{label}</span>
      <span className="mt-2 text-[22px] font-bold tabular-nums tracking-tight text-[color:var(--fg)]">{value}</span>
      {sub && <span className="mt-1 text-sm text-[color:var(--muted)]">{sub}</span>}
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#ce0e2d]">
        자세히 <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

async function upcomingBookings(where: object) {
  const today = dateOnly(kstToday())!;
  return prisma.booking.findMany({
    where: { ...where, status: { in: ["REQUESTED", "CONFIRMED"] }, scheduledDate: { gte: today } },
    orderBy: [{ scheduledDate: "asc" }, { timeSlot: "asc" }],
    take: 3,
    select: { id: true, bookingNumber: true, serviceType: true, scheduledDate: true, timeSlot: true, scheduledTime: true, status: true, patient: { select: { name: true } }, assignedStaff: { select: { name: true } } },
  });
}

function UpcomingList({ linkBase, rows, showPatient }: { linkBase: string; rows: Awaited<ReturnType<typeof upcomingBookings>>; showPatient?: boolean }) {
  return (
    <ul className="divide-y divide-gray-100">
      {rows.map((b) => (
        <li key={b.id}>
          <Link href={`${linkBase}/${b.id}`} className="flex items-center gap-4 py-3 hover:opacity-80">
            <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-[#f0f4f7] py-2">
              <span className="text-[11px] font-semibold text-[color:var(--muted)]">{TIME_SLOT_SHORT[b.timeSlot]}</span>
              <span className="text-sm font-bold tabular-nums">{fmtDayShort(b.scheduledDate).replace(/\s*\(.+\)/, "")}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{serviceName(b.serviceType)}</span>
              <span className="block truncate text-sm text-[color:var(--muted)]">
                {showPatient && b.patient.name ? `${b.patient.name} · ` : ""}
                {b.assignedStaff?.name ? `담당 ${b.assignedStaff.name}` : "담당자 배정 전"}
                {b.scheduledTime ? ` · ${b.scheduledTime}` : ""}
              </span>
            </span>
            <Badge tone={BOOKING_TONE[b.status]} dot>
              {BOOKING_STATUS_LABEL[b.status]}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function ServiceUserHome({ base, userId }: { base: string; userId: string }) {
  const [upcoming, meds, records, pendingLinks] = await Promise.all([
    upcomingBookings({ patientId: userId }),
    todayMedications(userId),
    listHealthRecords(userId, 365),
    prisma.familyLink.count({ where: { patientId: userId, status: "PENDING" } }),
  ]);
  const last = records[0];
  return (
    <>
      {pendingLinks > 0 && (
        <Notice tone="red">
          보호자가 가족 연결을 요청했어요 ({pendingLinks}건).{" "}
          <Link href={`${base}/family`} className="font-semibold underline">
            확인하기
          </Link>
        </Notice>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="다가오는 예약" value={`${upcoming.length}건`} sub={upcoming[0] ? `${fmtDayShort(upcoming[0].scheduledDate)} ${serviceName(upcoming[0].serviceType)}` : "예정된 방문이 없어요"} href={`${base}/bookings`} />
        <StatTile label="오늘 복약" value={meds.total ? `${meds.taken} / ${meds.total}` : "-"} sub={meds.total ? (meds.taken === meds.total ? "오늘 복약을 모두 마쳤어요" : `${meds.total - meds.taken}번 남았어요`) : "등록된 약이 없어요"} href={`${base}/medications`} />
        <StatTile
          label="최근 건강 기록"
          value={last ? (last.bloodPressureSys ? `${last.bloodPressureSys}/${last.bloodPressureDia}` : last.bloodSugar ? `${last.bloodSugar} mg/dL` : last.temperature ? `${last.temperature}°C` : last.heartRate ? `${last.heartRate} bpm` : `${last.weight} kg`) : "-"}
          sub={last ? fmtDateTime(last.recordedAt) : "오늘 혈압부터 기록해 보세요"}
          href={`${base}/health`}
        />
      </div>
      <Card
        title="다가오는 방문"
        action={
          <Link href={`${base}/bookings/new`} className={btnClass("primary", "sm")}>
            <CalendarCheck className="size-4" aria-hidden />
            예약 신청
          </Link>
        }
      >
        {upcoming.length ? <UpcomingList linkBase={`${base}/bookings`} rows={upcoming} /> : <EmptyState title="예정된 방문이 없어요" description="원하는 날짜와 시간대로 방문 서비스를 신청해 보세요." />}
      </Card>
    </>
  );
}

async function GuardianHome({ base, userId }: { base: string; userId: string }) {
  const links = await linkedPatients(userId);
  const pending = await prisma.familyLink.count({ where: { guardianId: userId, status: "PENDING" } });
  const ids = links.map((l) => l.patient.id);
  const upcoming = ids.length ? await upcomingBookings({ patientId: { in: ids } }) : [];
  const summaries = await Promise.all(
    links.map(async (l) => {
      const [meds, rec] = await Promise.all([
        todayMedications(l.patient.id),
        prisma.healthRecord.findFirst({ where: { patientId: l.patient.id }, orderBy: { recordedAt: "desc" }, select: { bloodPressureSys: true, bloodPressureDia: true, bloodSugar: true, recordedAt: true, hasAlert: true } }),
      ]);
      return { l, meds, rec };
    }),
  );
  return (
    <>
      <Card
        title="연결된 가족"
        description={pending ? `승인을 기다리는 요청 ${pending}건이 있어요.` : undefined}
        action={<TextLink href={`${base}/family`}>가족 연결 관리</TextLink>}
      >
        {summaries.length === 0 ? (
          <EmptyState
            title="아직 연결된 가족이 없어요"
            description="가족(서비스 이용자 회원)의 이메일이나 휴대폰 번호로 연결을 요청하고, 가족이 승인하면 기록을 함께 볼 수 있어요."
            action={
              <Link href={`${base}/family`} className={btnClass("primary", "sm")}>
                가족 연결하기
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {summaries.map(({ l, meds, rec }) => (
              <Link key={l.id} href={`${base}/family/${l.patient.id}`} className="rounded-2xl bg-[#f8f9fa] p-4 transition-colors hover:bg-[#f0f4f7]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-bold">
                    {l.patient.name ?? l.patient.email} <span className="font-normal text-[color:var(--muted)]">· {l.relationship}</span>
                  </p>
                  {rec?.hasAlert && <Badge tone="red">이상 징후</Badge>}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-[color:var(--muted)]">최근 혈압</dt>
                    <dd className="font-semibold tabular-nums">{rec?.bloodPressureSys ? `${rec.bloodPressureSys}/${rec.bloodPressureDia}` : "-"}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-[color:var(--muted)]">
                      <Pill className="size-3.5" aria-hidden />
                      오늘 복약
                    </dt>
                    <dd className="font-semibold tabular-nums">{meds.total ? `${meds.taken} / ${meds.total}` : "-"}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <Card
        title="가족의 다가오는 방문"
        action={
          ids.length > 0 ? (
            <Link href={`${base}/bookings/new`} className={btnClass("primary", "sm")}>
              대신 예약하기
            </Link>
          ) : undefined
        }
      >
        {upcoming.length ? <UpcomingList linkBase={`${base}/bookings`} rows={upcoming} showPatient /> : <EmptyState title="예정된 방문이 없어요" />}
      </Card>
    </>
  );
}

async function ProviderHome({ base, userId, isStaff }: { base: string; userId: string; isStaff: boolean }) {
  const today = dateOnly(kstToday())!;
  const [upcoming, toWrite, academy] = await Promise.all([
    upcomingBookings({ assignedStaffId: userId, status: "CONFIRMED" }),
    prisma.booking.count({ where: { assignedStaffId: userId, status: "CONFIRMED", scheduledDate: { lte: today } } }),
    academySummary(userId),
  ]);
  const done = academy.enrollments.filter((e) => e.completedAt).length;
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="다가오는 방문" value={isStaff ? `${upcoming.length}건` : "-"} sub={isStaff ? "배정된 방문 일정" : "방문 인력 지정 전"} href={`${base}/schedule`} />
        <StatTile label="작성할 방문 기록" value={isStaff ? `${toWrite}건` : "-"} sub="방문일이 지난 확정 예약" href={`${base}/schedule`} />
        <StatTile label="교육 현황" value={`${done} / ${academy.enrollments.length}`} sub={`수료 ${academy.certificates.length}건 · 바야다 인증 ${academy.credentials.length}건`} href={`${base}/education`} />
      </div>
      {!isStaff && (
        <Notice tone="blue">
          방문 일정은 바야다 운영팀이 방문 인력으로 지정한 제공자에게 보여요. 지원·자격 신청 처리 상황은 &lsquo;상담·문의 내역&rsquo;에서 볼 수 있어요.
        </Notice>
      )}
      {isStaff && (
        <Card title="다가오는 방문 일정" action={<TextLink href={`${base}/schedule`}>전체 일정</TextLink>}>
          {upcoming.length ? <UpcomingList linkBase={`${base}/schedule`} rows={upcoming} showPatient /> : <EmptyState title="배정된 방문이 없어요" />}
        </Card>
      )}
      <Card title="바야다 아카데미" description="같은 계정으로 교육을 듣고 수료증·바야다 인증을 받아요.">
        <a href={`${ACADEMY_URL}/ko/dashboard`} className={btnClass("outline", "sm")}>
          마이 러닝 열기 <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </Card>
    </>
  );
}

function OrganizationHome({ base, m, inquiries }: { base: string; m: Awaited<ReturnType<typeof requireMember>>; inquiries: Awaited<ReturnType<typeof listMemberInquiries>> }) {
  const vq = inquiries.find((q) => q.formType === "vendor-qualification");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <StatTile label="기관" value={m.webMemberProfile.orgName ?? "-"} sub={m.webMemberProfile.orgType ?? undefined} href={`${base}/organization`} />
      <StatTile
        label="자격 심사(VQ) 신청"
        value={vq ? WEB_INQUIRY_STATUS_LABEL[vq.status] : "신청 전"}
        sub={vq ? `${vq.referenceNo} · ${fmtDateTime(vq.createdAt)}` : "파트너(공급자) 자격 신청서를 제출해 주세요"}
        href={`${base}/organization`}
      />
    </div>
  );
}
