import { getDictionary, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale as Locale);

  return (
    <AuthProvider>
      <DictionaryProvider dictionary={dictionary}>
        <Header locale={locale} />
        <main className="min-h-[calc(100vh-64px-200px)]">{children}</main>
        <Footer locale={locale} />
      </DictionaryProvider>
    </AuthProvider>
  );
}
