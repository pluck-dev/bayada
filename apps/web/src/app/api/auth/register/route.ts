import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";
import { sendVerificationEmail } from "@bayada/services/account";
import { passwordError } from "@bayada/shared/password-policy";
import { isMemberType, ORG_TYPES, PROVIDER_ROLES } from "@bayada/shared/member";
import { appUrl, localeOr } from "@/lib/app-url";

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// 홈페이지 회원가입 — 아카데미와 같은 User 행(role STUDENT)을 만들고 회원 유형은 WebMemberProfile 에 둔다.
// 같은 계정으로 아카데미도 로그인된다(아카데미 직군은 아카데미 첫 화면에서 따로 묻지 않음 — 선택 정보).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = str(body.name, 50);
  const password = typeof body.password === "string" ? body.password : "";
  const phone = str(body.phone, 20);
  const memberType = isMemberType(body.memberType) ? body.memberType : null;

  if (!email || !name || !password || !phone) {
    return NextResponse.json({ error: "이름, 이메일, 휴대폰, 비밀번호는 필수예요." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "이메일 형식을 확인해 주세요." }, { status: 400 });
  if (!/^[0-9-]{9,13}$/.test(phone)) return NextResponse.json({ error: "휴대폰 번호를 확인해 주세요." }, { status: 400 });
  const pwError = passwordError(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
  if (!memberType) return NextResponse.json({ error: "회원 유형을 선택해 주세요." }, { status: 400 });
  if (body.agreeTerms !== true || body.agreePrivacy !== true) {
    return NextResponse.json({ error: "이용약관과 개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
  }
  const providerRole = memberType === "PROVIDER" ? str(body.providerRole, 30) : null;
  if (memberType === "PROVIDER" && !(providerRole && (PROVIDER_ROLES as readonly string[]).includes(providerRole))) {
    return NextResponse.json({ error: "직군을 선택해 주세요." }, { status: 400 });
  }
  const orgName = memberType === "ORGANIZATION" ? str(body.orgName, 100) : null;
  const orgType = memberType === "ORGANIZATION" ? str(body.orgType, 30) : null;
  if (memberType === "ORGANIZATION" && (!orgName || !orgType || !(ORG_TYPES as readonly string[]).includes(orgType))) {
    return NextResponse.json({ error: "기관명과 기관 유형을 입력해 주세요." }, { status: 400 });
  }

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return NextResponse.json(
      { error: "이미 가입된 이메일이에요. 바야다 아카데미 계정도 같은 계정이니 그 비밀번호로 로그인해 주세요." },
      { status: 409 },
    );
  }
  const optIn = body.marketing === true;
  const user = await prisma.user.create({
    data: {
      email,
      name,
      phone,
      password: await hash(password, 12),
      role: "STUDENT",
      webMemberProfile: {
        create: {
          memberType,
          providerRole,
          orgName,
          orgType,
          emailOptIn: optIn,
          smsOptIn: optIn,
          marketingConsentAt: optIn ? new Date() : null,
        },
      },
    },
    select: { id: true, email: true, name: true },
  });
  const locale = localeOr(body.locale);
  await sendVerificationEmail(user.id, (token) => appUrl(`/${locale}/auth/verify-email?token=${encodeURIComponent(token)}`)).catch((error) =>
    console.error("[web register] 인증 메일 발송 실패", error),
  );
  return NextResponse.json({ data: user }, { status: 201 });
}
