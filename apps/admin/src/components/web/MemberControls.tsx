"use client";

import { MEMBER_TYPES, MEMBER_TYPE_LABEL } from "@bayada/shared/member";
import { dismissWithdrawal, processWithdrawal, setMemberType, setVisitStaff } from "@/lib/actions/web-members";
import { Button, Card, Field, Select, Switch } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function MemberControls({
  userId,
  name,
  memberType,
  isVisitStaff,
  withdrawalRequested,
}: {
  userId: string;
  name: string;
  memberType: string;
  isVisitStaff: boolean;
  withdrawalRequested: boolean;
}) {
  const { run, isPending } = useAction();
  return (
    <div data-tour="member-controls" className="flex flex-col gap-4">
      <Card title="관리">
        <div className="flex flex-col gap-4">
          <Field label="회원 유형" htmlFor="m-type" hint="유형에 따라 홈페이지 마이페이지 메뉴가 바뀝니다.">
            <Select
              id="m-type"
              value={memberType}
              disabled={isPending}
              onChange={(x) =>
                run(() => setMemberType(userId, x), {
                  confirm: { title: `회원 유형을 '${MEMBER_TYPE_LABEL[x as keyof typeof MEMBER_TYPE_LABEL]}'(으)로 바꿀까요?`, body: "회원 마이페이지 메뉴가 바뀝니다. 제공자가 아니게 되면 방문 인력 지정도 풀립니다.", confirmLabel: "변경" },
                })
              }
              options={MEMBER_TYPES.map((t) => ({ value: t, label: MEMBER_TYPE_LABEL[t] }))}
            />
          </Field>
          {memberType === "PROVIDER" && (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption font-bold text-ink">방문 인력 지정</p>
                <p className="text-micro text-muted">자격·계약을 확인한 제공자만 켜세요. 켜면 예약 담당자로 배정할 수 있고, 본인 마이페이지에 방문 일정·방문 기록 작성이 열립니다.</p>
              </div>
              <Switch checked={isVisitStaff} disabled={isPending} onChange={(on) => run(() => setVisitStaff(userId, on))} aria-label="방문 인력 지정" />
            </div>
          )}
        </div>
      </Card>
      {withdrawalRequested && (
        <Card title="탈퇴 요청 처리">
          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              disabled={isPending}
              onClick={() =>
                run(() => processWithdrawal(userId), {
                  confirm: {
                    title: `${name} 님을 탈퇴 처리할까요?`,
                    body: "건강·복약 기록, 가족 연결, 간편 로그인 연결을 지우고 이메일·이름·연락처를 파기해 계정을 익명화합니다. 홈페이지·아카데미 모두 로그인할 수 없게 되며 되돌릴 수 없습니다. 예약·방문 기록과 아카데미 수료 기록은 익명으로 남습니다.",
                    confirmLabel: "탈퇴 처리",
                    danger: true,
                  },
                })
              }
            >
              탈퇴 처리 (개인정보 파기)
            </Button>
            <Button variant="ghost" disabled={isPending} onClick={() => run(() => dismissWithdrawal(userId))}>
              요청 철회 처리
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
