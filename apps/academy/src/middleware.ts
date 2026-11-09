import { createI18nMiddleware } from "@bayada/shared/i18n";

const i18nMiddleware = createI18nMiddleware();

export function middleware(request: any) {
  return i18nMiddleware(request);
}

export const config = {
  // review-access 는 언어 경로 밖의 리뷰 모드 화면. opengraph-image·twitter-image 는 루트 메타데이터 이미지 라우트 — 언어 경로로 보내면 404 라 공유 카드 이미지가 깨진다
  matcher: ["/((?!_next|api|opengraph-image|twitter-image|review-access|.*\\..*).*)"],
};
