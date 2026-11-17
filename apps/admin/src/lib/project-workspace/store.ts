import { createHash } from "node:crypto";
import { prisma, Prisma } from "@bayada/db";
import { getWorkspaceDefinition, type WorkspaceState } from "./definition";
import { stableStringify, validateTransition, WorkspaceError, type WorkspaceActor } from "./transition";

export const WORKSPACE_ID = "bayada-development-agreement";

export async function getWorkspace() {
  const definition = await getWorkspaceDefinition();
  return prisma.projectWorkspace.upsert({
    where: { id: WORKSPACE_ID },
    create: { id: WORKSPACE_ID, state: definition.initialState as Prisma.InputJsonValue },
    update: {},
  });
}

export async function saveWorkspace(
  baseRevision: number,
  proposed: WorkspaceState,
  actor: WorkspaceActor,
) {
  if (!Number.isSafeInteger(baseRevision) || baseRevision < 0) throw new WorkspaceError(400, "기준 버전이 필요합니다.");
  const eventId = proposed?.events?.at(-1)?.id;
  if (typeof eventId !== "string") throw new WorkspaceError(400, "변경 식별자가 필요합니다.");
  const requestHash = createHash("sha256").update(stableStringify({ baseRevision, proposed })).digest("hex");
  const definition = await getWorkspaceDefinition();
  await getWorkspace();

  return prisma.$transaction(async (tx) => {
    const previous = await tx.projectWorkspaceEvent.findUnique({ where: { id: eventId } });
    if (previous) {
      if (previous.actorId !== actor.id || previous.requestHash !== requestHash) throw new WorkspaceError(409, "같은 식별자의 다른 요청입니다.");
      return tx.projectWorkspace.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
    }
    const current = await tx.projectWorkspace.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
    if (current.revision !== baseRevision) throw new WorkspaceError(409, "다른 참여자가 먼저 저장했습니다. 최신 내용을 확인한 후 다시 저장하세요.");
    const { state, event } = validateTransition(definition, current.state as WorkspaceState, proposed, actor);
    const changed = await tx.projectWorkspace.updateMany({
      where: { id: WORKSPACE_ID, revision: baseRevision },
      data: { revision: state.revision, state: state as Prisma.InputJsonValue },
    });
    if (changed.count !== 1) throw new WorkspaceError(409, "다른 참여자가 먼저 저장했습니다. 최신 내용을 확인하세요.");
    await tx.projectWorkspaceEvent.create({
      data: { id: event.id, workspaceId: WORKSPACE_ID, revision: state.revision, actorId: actor.id, requestHash, detail: event as Prisma.InputJsonValue },
    });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "project.workspace.edit", target: `ProjectWorkspace:${WORKSPACE_ID}`, detail: { revision: state.revision, eventId: event.id, kind: event.kind } } });
    return tx.projectWorkspace.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
  }, { timeout: 15000 });
}

export async function importWorkspace(baseRevision: number, input: WorkspaceState, actor: WorkspaceActor) {
  if (!actor.isAdmin) throw new WorkspaceError(403, "이전 문서 가져오기는 최고 관리자만 할 수 있습니다.");
  const definition = await getWorkspaceDefinition();
  try { definition.validate(input); } catch { throw new WorkspaceError(400, "이전 문서의 데이터 검증에 실패했습니다."); }
  const state: WorkspaceState = JSON.parse(JSON.stringify(input));
  for (const baseline of state.baselines) {
    baseline.legacyToken = baseline.token;
    baseline.token = stableStringify(baseline.snapshot);
  }
  const event = {
    id: crypto.randomUUID(), kind: "이전 문서 가져오기", target: definition.projectId,
    actor: actor.name, actorId: actor.id, at: new Date().toISOString(), reason: "최고 관리자가 이전 로컬 문서와 이력을 서버 공동 문서로 가져옴",
    before: null, after: { importedRevision: input.revision, source: "local-document", previousActors: "이전 로컬 기록의 작성자는 로그인 인증 기록과 구분" },
  };
  state.revision++;
  state.events.push(event);
  definition.validate(state);
  await getWorkspace();
  return prisma.$transaction(async (tx) => {
    const current = await tx.projectWorkspace.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
    if (current.revision !== 0 || baseRevision !== 0) throw new WorkspaceError(409, "서버에서 편집이 시작된 문서는 가져오기로 덮어쓸 수 없습니다.");
    const changed = await tx.projectWorkspace.updateMany({
      where: { id: WORKSPACE_ID, revision: 0 }, data: { revision: state.revision, state: state as Prisma.InputJsonValue },
    });
    if (!changed.count) throw new WorkspaceError(409, "다른 참여자가 먼저 문서를 저장했습니다.");
    await tx.projectWorkspaceEvent.create({ data: {
      id: event.id, workspaceId: WORKSPACE_ID, revision: state.revision, actorId: actor.id,
      requestHash: createHash("sha256").update(stableStringify(input)).digest("hex"), detail: event,
    } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "project.workspace.import", target: `ProjectWorkspace:${WORKSPACE_ID}`, detail: { revision: state.revision } } });
    return tx.projectWorkspace.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
  });
}
