import { redirect } from "next/navigation";
import { prisma } from "@bayada/db";
import { getAdminUser } from "@/lib/session";
import { can, homePath } from "@/lib/rbac";
import { CredentialTabs } from "@/components/credentials/CredentialTabs";

export default async function CredentialsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getAdminUser();
  if (!user) redirect(`/${locale}/auth/login`);
  if (!can(user, "credential.read")) redirect(homePath(user, locale));

  const base = `/${locale}/credentials`;
  // 탭 배지 = 이 역할이 지금 처리할 수 있는 건수 (심사위원은 평가 대기·평가 중, 운영자는 승인 대기)
  const todo = await prisma.credentialApplication.count({
    where: {
      status: {
        in: [
          ...(can(user, "credential.evaluate") ? (["SUBMITTED", "EVALUATING"] as const) : []),
          ...(can(user, "credential.approve") ? (["EVALUATED"] as const) : []),
        ],
      },
    },
  });
  const items = [
    { href: base, label: "심사 큐", count: todo },
    ...(can(user, "credential.approve") ? [{ href: `${base}/issued`, label: "발급된 인증" }] : []),
    ...(can(user, "credential.program") ? [{ href: `${base}/programs`, label: "인증 과정" }] : []),
  ];

  return (
    <>
      <CredentialTabs items={items} />
      {children}
    </>
  );
}
