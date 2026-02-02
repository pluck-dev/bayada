import { getDictionary, i18nConfig, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DictionaryProvider } from "@/components/DictionaryProvider";

// 동적 라우트에서 허용되는 locale 값 생성
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 유효하지 않은 로케일이면 404
  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <DictionaryProvider dictionary={dict}>
      <Header />
      <main>{children}</main>
      <Footer />
    </DictionaryProvider>
  );
}
