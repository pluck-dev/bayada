import { getDictionary, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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
        <SiteHeader locale={locale} />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter locale={locale} />
      </DictionaryProvider>
    </AuthProvider>
  );
}
