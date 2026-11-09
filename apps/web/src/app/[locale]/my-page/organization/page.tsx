import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { WEB_INQUIRY_STATUS_LABEL } from "@bayada/shared/web-content";
import { requireMember } from "@/lib/member/session";
import { listMemberInquiries } from "@/lib/member/queries";
import { ACADEMY_URL } from "@/lib/app-url";
import { Badge, Card, EmptyState, INQUIRY_TONE, InfoList, Notice, PageTitle, TextLink, btnClass, fmtDateTime } from "@/components/member/ui";

export default async function OrganizationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/organization");
  const p = m.webMemberProfile;
  if (p.memberType !== "ORGANIZATION") return <Notice>기관 회원 화면이에요.</Notice>;
  const vq = await listMemberInquiries(m, ["vendor-qualification", "government-consult", "deicloud-early-access"]);
  const canOrg = !!m.organizationId && (m.role === "ORG_ADMIN" || m.role === "ADMIN");
  const base = `/${locale}/my-page`;
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="기관 정보" description="기관 정보와 파트너(공급자) 자격 심사(VQ) 진행 상황, 구성원 교육 현황 바로가기예요." />
      <Card title="기관" action={<TextLink href={`${base}/settings`}>수정</TextLink>}>
        <InfoList
          items={[
            ["기관명", p.orgName ?? "-"],
            ["기관 유형", p.orgType ?? "-"],
            ["담당자", `${m.name ?? "-"} · ${m.phone ?? ""}`],
            ["이메일", m.email],
            ...(m.organization ? ([["아카데미 기관", m.organization.name]] as [string, string][]) : []),
          ]}
        />
      </Card>
      <Card
        title="자격 심사(VQ)·기관 신청"
        description="파트너(공급자) 자격 신청서를 내면 운영팀이 검토해 상태를 바꿔요."
        action={
          <Link href={`/${locale}/providers/qualification`} className={btnClass("outline", "sm")}>
            자격 신청서 작성
          </Link>
        }
      >
        {vq.length === 0 ? (
          <EmptyState title="아직 낸 신청이 없어요" description="로그인한 채로 신청서를 제출하면 여기에 처리 상태가 보여요." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {vq.map((q) => (
              <li key={q.id}>
                <Link href={`${base}/inquiries/${q.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tabular-nums">{q.referenceNo}</span>
                    <span className="block text-sm text-[color:var(--muted)]">{fmtDateTime(q.createdAt)} 접수</span>
                  </span>
                  <Badge tone={INQUIRY_TONE[q.status]} dot>
                    {WEB_INQUIRY_STATUS_LABEL[q.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card
        title="소속 구성원 교육 현황"
        description={
          canOrg
            ? "구성원 초대·교육 배정·이수 현황은 바야다 아카데미 기관 대시보드에서 관리해요."
            : "기관 단위 교육(구성원 배정·이수 관리)은 아카데미 기관 도입 후 기관 관리자 계정으로 이용할 수 있어요. 도입 문의를 남겨 주세요."
        }
      >
        {canOrg ? (
          <a href={`${ACADEMY_URL}/${locale}/business`} className={btnClass("primary", "sm")}>
            기관 대시보드 열기 <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <a href={`${ACADEMY_URL}/${locale}#org`} className={btnClass("outline", "sm")}>
            아카데미 기관 도입 안내 <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </Card>
    </div>
  );
}
