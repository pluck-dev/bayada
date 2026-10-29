import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { decodeParam } from "@/lib/params";
import { loadEligibility } from "@/lib/queries/credentials";
import { OPEN_APP_STATUSES } from "@/lib/credentials";

type Ctx = { params: Promise<{ slug: string }> };

const REASON: Record<string, string> = {
  inactive: "지금은 신청을 받지 않는 인증 과정이에요",
  prerequisites: "선수 프로그램을 모두 수료해야 신청할 수 있어요",
  open: "이미 심사 중인 신청이 있어요",
  held: "이미 유효한 인증을 보유하고 있어요. 만료가 가까워지면 갱신 신청할 수 있어요",
};

const MAX_MOTIVATION = 2000;

/** 바야다 인증 신청. 자격은 화면과 같은 eligibility 규칙으로 서버에서 다시 판정한다 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const { slug } = await params;
    const body = (await req.json().catch(() => ({}))) as { motivation?: unknown };
    const motivation = typeof body.motivation === "string" ? body.motivation.trim() : "";
    if (motivation.length > MAX_MOTIVATION) {
      return NextResponse.json({ error: `신청 동기는 ${MAX_MOTIVATION}자 이내로 적어 주세요` }, { status: 400 });
    }

    const program = await prisma.credentialProgram.findUnique({ where: { slug: decodeParam(slug) }, select: { id: true } });
    if (!program) return NextResponse.json({ error: "인증 과정을 찾을 수 없어요" }, { status: 404 });
    const check = await loadEligibility(program.id, viewer.id, viewer);
    if (!check) return NextResponse.json({ error: "인증 과정을 찾을 수 없어요" }, { status: 404 });
    if (!check.result.ok) {
      return NextResponse.json({ error: REASON[check.result.reason] }, { status: check.result.reason === "open" ? 409 : 403 });
    }

    // 진행 중 신청은 1건 — unique 제약이 없어 (사용자, 과정) 단위 트랜잭션 락으로 중복 클릭·동시 요청을 직렬화
    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`credential-apply:${viewer.id}:${program.id}`}))`;
      const open = await tx.credentialApplication.findFirst({
        where: { userId: viewer.id, programId: program.id, status: { in: OPEN_APP_STATUSES } },
        select: { id: true },
      });
      if (open) return null;
      return tx.credentialApplication.create({
        data: { userId: viewer.id, programId: program.id, motivation: motivation || null },
        select: { id: true },
      });
    });
    if (!created) return NextResponse.json({ error: REASON.open }, { status: 409 });
    await prisma.auditLog.create({
      data: {
        actorId: viewer.id,
        action: "credential.apply",
        target: `CredentialApplication:${created.id}`,
        detail: { programId: program.id, renewal: check.result.renewal },
      },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
