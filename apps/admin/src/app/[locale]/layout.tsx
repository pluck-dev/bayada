import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@bayada/shared";
import type { Locale } from "@bayada/shared";
import { DictionaryProvider } from "@/components/DictionaryProvider";

export const metadata: Metadata = {
  title: "BAYADA Admin",
  description: "BAYADA 관리자 대시보드",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 유효하지 않은 locale인 경우 기본값 사용
  const validLocale: Locale = isValidLocale(locale) ? locale : "ko";
  const dictionary = await getDictionary(validLocale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      {children}
    </DictionaryProvider>
  );
}
