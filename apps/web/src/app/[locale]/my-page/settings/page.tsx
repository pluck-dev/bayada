import { MEMBER_TYPE_LABEL } from "@bayada/shared/member";
import { requireMember } from "@/lib/member/session";
import { NotificationForm, PasswordForm, ProfileForm, WithdrawalForm } from "@/components/member/SettingsForms";
import { Card, PageTitle, fmtDate } from "@/components/member/ui";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await requireMember(locale, "/my-page/settings");
  const p = m.webMemberProfile;
  return (
    <div className="flex flex-col gap-5">
      <PageTitle title="회원 정보·설정" description={`${MEMBER_TYPE_LABEL[p.memberType]} 회원 · ${m.email}${m.emailVerifiedAt ? " (인증됨)" : " (미인증)"}`} />
      <Card title="프로필·연락처" description="이메일(로그인 아이디)은 바꿀 수 없어요. 회원 유형 변경은 고객센터로 문의해 주세요.">
        <ProfileForm
          type={p.memberType}
          initial={{ name: m.name ?? "", phone: m.phone ?? "", address: p.address ?? "", providerRole: p.providerRole ?? "", orgName: p.orgName ?? "", orgType: p.orgType ?? "" }}
        />
      </Card>
      <Card title="알림 수신" description={p.marketingConsentAt ? `마지막 변경 ${fmtDate(p.marketingConsentAt)}` : "예약 확정·문의 처리 같은 필수 안내는 설정과 관계없이 보내요."}>
        <NotificationForm emailOptIn={p.emailOptIn} smsOptIn={p.smsOptIn} />
      </Card>
      <Card title="비밀번호 변경" description="홈페이지와 바야다 아카데미에 같이 쓰는 비밀번호예요.">
        <PasswordForm locale={locale} />
      </Card>
      <Card id="withdrawal" title="회원 탈퇴" description="탈퇴를 요청하면 운영팀이 진행 중인 예약을 확인한 뒤 계정과 개인정보를 파기해요. 같은 계정을 쓰는 바야다 아카데미도 함께 탈퇴돼요.">
        <WithdrawalForm requestedAt={p.withdrawalRequestedAt ? fmtDate(p.withdrawalRequestedAt) : null} />
      </Card>
    </div>
  );
}
