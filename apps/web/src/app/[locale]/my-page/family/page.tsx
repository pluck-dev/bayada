import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@bayada/db";
import { FAMILY_LINK_STATUS_LABEL } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { FamilyRequestForm, RespondButtons, RevokeButton } from "@/components/member/FamilyControls";
import { Badge, Card, EmptyState, Notice, PageTitle, fmtDateTime, type Tone } from "@/components/member/ui";

const TONE: Record<string, Tone> = { PENDING: "amber", APPROVED: "green", REJECTED: "gray", REVOKED: "gray" };

export default async function FamilyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/family");
  const type = m.webMemberProfile.memberType;
  const base = `/${locale}/my-page`;

  if (type === "SERVICE_USER") {
    const links = await prisma.familyLink.findMany({
      where: { patientId: m.id, status: { in: ["PENDING", "APPROVED"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, relationship: true, createdAt: true, guardian: { select: { name: true, email: true, phone: true } } },
    });
    const pending = links.filter((l) => l.status === "PENDING");
    const approved = links.filter((l) => l.status === "APPROVED");
    return (
      <div className="flex flex-col gap-5">
        <PageTitle title="가족 연결" description="보호자가 연결을 요청하면 여기서 승인해요. 승인한 보호자는 내 예약·건강 기록·복약·방문 기록을 볼 수 있어요." />
        <Card title={`승인 대기 ${pending.length}건`}>
          {pending.length === 0 ? (
            <EmptyState title="기다리는 요청이 없어요" description="보호자에게 내가 가입한 이메일이나 휴대폰 번호를 알려 주면 연결을 요청할 수 있어요." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {pending.map((l) => (
                <li key={l.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[15px] font-bold">
                      {l.guardian.name ?? "보호자"} <span className="font-normal text-[color:var(--muted)]">· 나의 {l.relationship} 이라고 했어요</span>
                    </p>
                    <p className="text-sm text-[color:var(--muted)]">
                      {l.guardian.email}
                      {l.guardian.phone ? ` · ${l.guardian.phone}` : ""} · {fmtDateTime(l.createdAt)} 요청
                    </p>
                  </div>
                  <RespondButtons id={l.id} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={`연결된 보호자 ${approved.length}명`}>
          {approved.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">아직 연결된 보호자가 없어요.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {approved.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[15px] font-bold">
                      {l.guardian.name ?? l.guardian.email} <span className="font-normal text-[color:var(--muted)]">· {l.relationship}</span>
                    </p>
                    <p className="text-sm text-[color:var(--muted)]">{l.guardian.email}</p>
                  </div>
                  <RevokeButton id={l.id} who={l.guardian.name ?? l.guardian.email} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  if (type !== "GUARDIAN") return <Notice>가족 연결은 서비스 이용자·보호자 회원이 이용해요.</Notice>;

  const links = await prisma.familyLink.findMany({
    where: { guardianId: m.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: { id: true, status: true, relationship: true, requestedContact: true, createdAt: true, patient: { select: { id: true, name: true } } },
  });
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="가족 연결" description="가족(서비스 이용자 회원)에게 연결을 요청하고, 가족이 승인하면 예약·건강·복약·방문 기록을 함께 봐요." />
      <Card title="연결된 가족·요청">
        {links.length === 0 ? (
          <EmptyState title="아직 요청한 가족이 없어요" description="아래에서 가족의 이메일이나 휴대폰 번호로 연결을 요청해 주세요." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {links.map((l) => {
              const approved = l.status === "APPROVED";
              // 승인 전에는 이용자 이름을 보여 주지 않는다(입력한 연락처만)
              const who = approved ? (l.patient.name ?? l.requestedContact) : l.requestedContact;
              return (
                <li key={l.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-bold">{who}</p>
                      <Badge tone={TONE[l.status]} dot>
                        {FAMILY_LINK_STATUS_LABEL[l.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-[color:var(--muted)]">
                      {l.relationship} · {fmtDateTime(l.createdAt)} 요청
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {approved && (
                      <Link href={`${base}/family/${l.patient.id}`} className="inline-flex h-9 items-center gap-1 rounded-xl px-3.5 text-sm font-semibold text-[#ce0e2d] hover:bg-red-50">
                        기록 보기 <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    )}
                    {(approved || l.status === "PENDING") && <RevokeButton id={l.id} who={who} label={approved ? "연결 해제" : "요청 취소"} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Card title="새 연결 요청">
        <FamilyRequestForm />
      </Card>
    </div>
  );
}
