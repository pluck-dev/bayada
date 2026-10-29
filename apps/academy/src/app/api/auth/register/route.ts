import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";
import { sendVerificationEmail } from "@bayada/services/account";
import { isJobRole, passwordError } from "@/lib/signup-policy";
import { appUrl, localeOr } from "@/lib/app-url";

// 외부 회원가입. 사내 조직에 묶지 않으므로 PUBLIC 강의만 보인다.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
  const jobRole = isJobRole(body.jobRole) ? body.jobRole : null;

  if (!email || !name || !password) {
    return NextResponse.json({ error: "이름, 이메일, 비밀번호는 필수예요." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식을 확인해 주세요." }, { status: 400 });
  }
  const pwError = passwordError(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
  if (!jobRole) return NextResponse.json({ error: "직군을 선택해 주세요." }, { status: 400 });

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return NextResponse.json({ error: "이미 가입된 이메일이에요." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { email, name, phone, jobRole, password: await hash(password, 12), role: "STUDENT" },
    select: { id: true, email: true, name: true },
  });
  // 이메일 인증은 선택(가입 마찰 최소화) — 메일 실패가 가입을 막지 않는다. 미인증이면 마이 러닝에 배너가 뜬다
  const locale = localeOr(body.locale);
  await sendVerificationEmail(user.id, (token) => appUrl(`/${locale}/auth/verify-email?token=${encodeURIComponent(token)}`)).catch(
    (error) => console.error("[register] 인증 메일 발송 실패", error)
  );
  return NextResponse.json({ data: user }, { status: 201 });
}
