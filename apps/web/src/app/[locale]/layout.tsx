import { getDictionary, i18nConfig, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <Header dict={dict} locale={locale} />
      <main>{children}</main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
