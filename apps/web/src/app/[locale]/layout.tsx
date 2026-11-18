import { getDictionary, i18nConfig, isValidLocale } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { getServices } from "@/lib/web-services";
import { getSiteInfo } from "@/lib/web-content";

// 어드민에서 고친 콘텐츠(DB)를 다시 읽는 주기(초). 저장 즉시 반영은 어드민이 POST /api/revalidate 를 부른다
export const revalidate = 300;

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

  const [dict, company, services] = await Promise.all([getDictionary(locale as Locale), getSiteInfo(), getServices()]);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Header services={services} dict={dict} locale={locale} />
      <main>{children}</main>
      <Footer services={services} dict={dict} locale={locale} company={company} />
    </>
  );
}
