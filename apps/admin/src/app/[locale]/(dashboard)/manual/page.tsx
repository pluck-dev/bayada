import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { ManualView } from "@/components/help/ManualView";

export const metadata: Metadata = { title: "운영 매뉴얼 · BAYADA Admin" };

/** 운영 매뉴얼 — 모든 어드민 역할이 본다(권한 검사 없이 로그인만). 내용 원본은 components/help/manual.ts (도움말 패널과 공용) */
export default async function ManualPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await getAdminUser())) redirect(`/${locale}/auth/login`);
  return (
    <>
      <PageHeader
        title="운영 매뉴얼"
        description="이 어드민으로 하는 일을 실제 화면·버튼 이름 그대로 정리했어요. 어느 화면에서든 사이드바 '도움말'을 누르면 그 화면에 맞는 글이 열려요."
      />
      <ManualView locale={locale} />
    </>
  );
}
