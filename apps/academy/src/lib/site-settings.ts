// 어드민 '사이트 설정' 값 읽기 (서버 전용). 행이 없으면 @bayada/shared/site-settings 의 기본값(옛 하드코딩 문구).
// 홈·헤더·푸터는 로그인 쿠키를 읽는 동적 렌더링이라 요청마다 DB 를 읽는다 → 어드민 저장 즉시 반영(별도 revalidate 불필요).
import { cache } from "react";
import { prisma } from "@bayada/db";
import { SITE_SETTING_DEFAULTS, SITE_SETTING_KEYS, resolveSiteSettings, type SiteSettings } from "@bayada/shared/site-settings";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: SITE_SETTING_KEYS } } });
    return resolveSiteSettings(rows);
  } catch (e) {
    // 빌드 시 정적 생성(not-found 등)처럼 DB 가 없을 때도 화면은 떠야 한다 — 기본값으로
    console.error("[site-settings] DB 읽기 실패, 기본값 사용", e);
    return SITE_SETTING_DEFAULTS;
  }
});
