// 기관 도입 문의 메일·운영 연락처는 어드민 '사이트 설정'(lib/site-settings.ts)으로 옮겼다.

// 수료증 QR·검증 링크의 절대 주소 기준 (layout metadataBase 와 같은 값)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr").replace(/\/+$/, "");
