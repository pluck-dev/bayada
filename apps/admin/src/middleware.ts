import { createI18nMiddleware } from "@bayada/shared";

const i18nMiddleware = createI18nMiddleware();

export function middleware(request: any) {
  return i18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
