import { NextResponse } from "next/server";
import { createProjectInvitation } from "@/lib/project-workspace/invitations";
import { assertSameOrigin, privateHeaders, readBody, workspaceFailure, workspaceUser } from "@/lib/project-workspace/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { actor } = await workspaceUser();
    const body = await readBody(request);
    const invitation = await createProjectInvitation(body.email, actor);
    return NextResponse.json({ token: invitation.token, expiresAt: invitation.expiresAt.toISOString() }, { headers: privateHeaders });
  } catch (error) { return workspaceFailure(error); }
}
