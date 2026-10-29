// 운영 주체·대표 연락처는 아직 미확정(피그마 W1 ⑫). 기존 B-Academy 운영 메일을 임시 창구로 쓴다.
export const INQUIRY_EMAIL = "b-academy@bayadakorea.com";
export const INQUIRY_MAILTO = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent("[BAYADA Academy] 기관 도입 문의")}`;

// 수료증 QR·검증 링크의 절대 주소 기준 (layout metadataBase 와 같은 값)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://academy.bayada.co.kr").replace(/\/+$/, "");
