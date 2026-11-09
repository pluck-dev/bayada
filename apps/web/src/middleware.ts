import { createI18nMiddleware } from "@bayada/shared/i18n";

const i18nMiddleware = createI18nMiddleware();

export function middleware(request: any) {
  return i18nMiddleware(request);
}

export const config = {
  // review-access 는 언어 경로 밖의 리뷰 모드 화면
  matcher: ["/((?!_next|api|review-access|.*\\..*).*)"],
};
