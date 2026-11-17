import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { WorkspaceError, type WorkspaceActor } from "./transition";

export const privateHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };

export async function workspaceUser() {
  const user = await getAdminUser();
  if (!user) throw new WorkspaceError(401, "로그인이 필요합니다.");
  if (!can(user, "project.workspace")) throw new WorkspaceError(403, "프로젝트 협의 권한이 없습니다.");
  const actor: WorkspaceActor = {
    id: user.id, name: user.name || user.email,
    party: user.roleKey === "custom_project_client" ? "고객사" : "개발사", isAdmin: user.roleKey === "ADMIN",
  };
  return { user, actor };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expected = `${request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")}://${request.headers.get("host") || url.host}`;
  if (!origin || origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new WorkspaceError(403, "같은 사이트에서 요청해 주세요.");
  }
}

export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new WorkspaceError(415, "JSON 요청이 필요합니다.");
  const reader = request.body?.getReader();
  if (!reader) throw new WorkspaceError(400, "요청 내용이 없습니다.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 8 * 1024 * 1024) { await reader.cancel(); throw new WorkspaceError(413, "문서 크기가 8MB를 초과했습니다."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new WorkspaceError(400, "JSON 형식을 확인하세요."); }
}

export function workspaceFailure(error: unknown) {
  if (error instanceof WorkspaceError) return NextResponse.json({ error: error.message }, { status: error.status, headers: privateHeaders });
  console.error("Project workspace request failed", error);
  return NextResponse.json({ error: "프로젝트 협의 처리 중 오류가 발생했습니다." }, { status: 500, headers: privateHeaders });
}
