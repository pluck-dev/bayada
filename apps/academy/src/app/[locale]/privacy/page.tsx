import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/LegalDocument";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalDocument slug="privacy" locale={locale} />;
}
