import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { canManageOrg } from "@/lib/queries/business";
import { orgInviteMail, trySendMail } from "@bayada/services/account";
import { appUrl, localeOr } from "@/lib/app-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_INVITES = 100;

/**
 * 직원 초대. 초대 링크(토큰)를 만들어 메일로 보내고, 링크도 돌려줘 관리자가 직접 전달할 수도 있게 한다.
 * 메일 실패는 초대를 막지 않는다(emailed 에 성공한 주소만). 같은 이메일을 다시 초대하면 기존 대기 중 링크를 그대로 쓰고 메일은 다시 보낸다.
 */
export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!canManageOrg(viewer)) return NextResponse.json({ error: "기관 관리자만 초대할 수 있어요" }, { status: 403 });
    const organizationId = viewer.organizationId;

    const body = (await request.json().catch(() => ({}))) as { emails?: unknown; locale?: unknown };
    const raw = typeof body.emails === "string" ? body.emails : Array.isArray(body.emails) ? body.emails.join(",") : "";
    const tokens = [
      ...new Set(
        raw
          .split(/[\s,;]+/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
    const invalid = tokens.filter((e) => !EMAIL_RE.test(e));
    const emails = tokens.filter((e) => EMAIL_RE.test(e));
    if (emails.length === 0) {
      return NextResponse.json({ error: "초대할 이메일을 입력해 주세요", invalid }, { status: 400 });
    }
    if (emails.length > MAX_INVITES) {
      return NextResponse.json({ error: `한 번에 ${MAX_INVITES}명까지 초대할 수 있어요` }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: { organizationId, email: { in: emails } },
      select: { email: true },
    });
    const memberSet = new Set(members.map((m) => m.email));
    const targets = emails.filter((e) => !memberSet.has(e));

    const invites = await prisma.$transaction(
      targets.map((email) =>
        prisma.orgInvite.upsert({
          where: { organizationId_email: { organizationId, email } },
          create: { organizationId, email, token: randomBytes(24).toString("base64url") },
          // 이미 수락됐던 초대(이후 조직을 떠난 경우)는 새 링크로 다시 연다
          update: {},
          select: { id: true, email: true, token: true, acceptedAt: true, createdAt: true },
        })
      )
    );
    const reopened = invites.filter((i) => i.acceptedAt);
    if (reopened.length) {
      await prisma.$transaction(
        reopened.map((i) =>
          prisma.orgInvite.update({
            where: { id: i.id },
            data: { acceptedAt: null, token: randomBytes(24).toString("base64url") },
          })
        )
      );
    }
    if (targets.length) {
      await prisma.auditLog.create({
        data: {
          actorId: viewer.id,
          action: "org.invite",
          target: `Organization:${organizationId}`,
          detail: { emails: targets },
        },
      });
    }
    const fresh = await prisma.orgInvite.findMany({
      where: { organizationId, email: { in: targets } },
      select: { id: true, email: true, token: true },
    });
    const emailed: string[] = [];
    if (fresh.length) {
      const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true } });
      const locale = localeOr(body.locale);
      const sent = await Promise.all(
        fresh.map((i) =>
          trySendMail(
            orgInviteMail({
              to: i.email,
              organizationName: org?.name ?? "기관",
              inviterName: viewer.name,
              url: appUrl(`/${locale}/invite/${i.token}`),
            })
          )
        )
      );
      fresh.forEach((i, n) => sent[n] && emailed.push(i.email));
    }
    return NextResponse.json({ invites: fresh, alreadyMembers: [...memberSet], invalid, emailed }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
