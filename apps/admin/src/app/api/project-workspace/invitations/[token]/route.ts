import { NextResponse } from "next/server";
import { clientIp } from "@bayada/services/account";
import { acceptProjectInvitation } from "@/lib/project-workspace/invitations";
import { assertSameOrigin, privateHeaders, readBody, workspaceFailure } from "@/lib/project-workspace/http";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(request);
    const { token } = await params;
    await acceptProjectInvitation(token, await readBody(request), clientIp(request.headers));
    return NextResponse.json({ ok: true }, { headers: privateHeaders });
  } catch (error) { return workspaceFailure(error); }
}
