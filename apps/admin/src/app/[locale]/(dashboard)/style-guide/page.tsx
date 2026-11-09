import { redirect } from "next/navigation";
import { requirePage } from "@/lib/session";
import { homePath } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import { StyleGuide } from "@/components/style-guide/StyleGuide";

export const metadata = { title: "스타일 가이드 · BAYADA Admin" };

/** 어드민 디자인 시스템 — 토큰과 모든 컴포넌트 상태. Super Admin 전용 */
export default async function StyleGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("dashboard", locale);
  if (user.roleKey !== "ADMIN") redirect(homePath(user, locale));
  return (
    <>
      <PageHeader
        title="스타일 가이드"
        description="어드민 콘솔의 토큰과 컴포넌트 전체 상태입니다. 새 화면은 여기 있는 조각으로만 조립합니다 — 브라우저 기본 컨트롤(select·checkbox·date·file·confirm·title 툴팁)은 쓰지 않습니다."
      />
      <StyleGuide />
    </>
  );
}
