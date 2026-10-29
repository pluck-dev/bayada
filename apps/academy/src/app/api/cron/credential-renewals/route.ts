import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { credentialRenewalMail, trySendMail } from "@bayada/services/account";
import { credentialState, daysLeft } from "@/lib/credentials";
import { formatDate } from "@/lib/labels";
import { appUrl } from "@/lib/app-url";

/**
 * 바야다 인증 갱신 안내 메일 — 하루 한 번 외부 스케줄러(호스트 cron·EventBridge 등)가 호출한다.
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<academy>/api/cron/credential-renewals
 * 화면 안 배너(takeRenewalNotices·renewalNotifiedAt)는 그대로 두고, 메일은 인증마다 한 번(renewalEmailedAt)만 보낸다.
 * CRON_SECRET 이 없으면 운영에서는 거부, 개발에서는 인증 없이 허용한다.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET 이 설정되지 않았습니다" }, { status: 503 });
  }

  const now = new Date();
  const rows = await prisma.credential.findMany({
    where: { revokedAt: null, renewalEmailedAt: null, expiresAt: { gt: now } },
    select: {
      id: true,
      number: true,
      expiresAt: true,
      revokedAt: true,
      user: { select: { email: true, name: true } },
      program: { select: { slug: true, title: true, renewalNoticeDays: true } },
    },
  });
  // 알림 일수가 과정마다 달라 DB where 로 못 거른다
  const due = rows.filter((c) => credentialState(c, c.program.renewalNoticeDays, now) === "expiring");

  let sent = 0;
  let failed = 0;
  for (const c of due) {
    // 동시에 두 번 호출돼도 한 통만: 먼저 표시를 선점하고 보낸다, 실패하면 되돌려 다음 실행에서 다시 시도
    const claimed = await prisma.credential.updateMany({ where: { id: c.id, renewalEmailedAt: null }, data: { renewalEmailedAt: now } });
    if (claimed.count !== 1) continue;
    const ok = await trySendMail(
      credentialRenewalMail({
        to: c.user.email,
        name: c.user.name,
        programTitle: c.program.title,
        number: c.number,
        expiresOn: formatDate(c.expiresAt!),
        daysLeft: daysLeft(c.expiresAt!, now),
        url: appUrl(`/ko/certifications/${encodeURIComponent(c.program.slug)}`),
      })
    );
    if (ok) sent++;
    else {
      failed++;
      await prisma.credential.update({ where: { id: c.id }, data: { renewalEmailedAt: null } });
    }
  }
  return NextResponse.json({ due: due.length, sent, failed });
}
