import { getDictionary, i18nConfig, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeiBudProvider } from "@/components/deibud/DeiBudProvider";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

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
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Header dict={dict} locale={locale} />
      <main>{children}</main>
      <Footer dict={dict} locale={locale} />
      <DeiBudProvider />
    </>
  );
}
