import { type NextRequest, NextResponse } from "next/server";
import { i18nConfig, isValidLocale } from "./config";

// Accept-Language 헤더에서 선호 로케일 추출
function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return i18nConfig.defaultLocale;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, priority] = lang.trim().split(";q=");
      return {
        code: code?.split("-")[0]?.toLowerCase() ?? "",
        priority: priority ? parseFloat(priority) : 1,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  for (const { code } of languages) {
    if (isValidLocale(code)) return code;
  }

  return i18nConfig.defaultLocale;
}

export function createI18nMiddleware() {
  return function i18nMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 정적 파일, API, _next 등은 무시
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".") // 파일 확장자
    ) {
      return NextResponse.next();
    }

    // URL에 이미 로케일이 있는지 확인
    const pathnameHasLocale = i18nConfig.locales.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
      return NextResponse.next();
    }

    // 로케일이 없으면 감지 후 리다이렉트
    const locale = getPreferredLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;

    return NextResponse.redirect(newUrl);
  };
}
