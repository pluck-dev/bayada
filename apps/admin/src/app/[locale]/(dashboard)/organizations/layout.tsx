import { requirePage } from "@/lib/session";

// 기존 B2B·결제 화면(주문·청구서·기관)은 Super Admin 전용
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
