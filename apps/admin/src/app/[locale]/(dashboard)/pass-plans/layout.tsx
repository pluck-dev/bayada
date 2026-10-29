import { requirePage } from "@/lib/session";

// 패스 요금제는 결제 화면과 같은 권한(Super Admin)
export default async function CommerceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePage("commerce", locale);
  return children;
}
