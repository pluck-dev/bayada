import type { HeroSlide } from "@/types";

// 홈 히어로 슬라이드 기본값 — DB(WebHeroSlide)에 행이 없거나 DB 를 못 읽을 때 쓰고, import:web 이 이 값을 DB 로 옮긴다.
// 문구는 슬라이드마다 둘 수 있지만 원래 화면은 세 장이 같은 문구다.
const TITLE = "무엇보다 소중한 것에\n집중할 수 있도록 —\n비교할 수 없는 돌봄";
const SUBTITLE =
  "사명감과 진심을 바탕으로, 우리는 최고 수준의 홈 헬스케어 서비스를 제공합니다. 이를 통해 고객과 가족이 안전하고, 편안하며, 독립적인 삶을 유지할 수 있도록 돕습니다.";

export const heroSlides: HeroSlide[] = [1, 2, 3].map((n) => ({
  id: `hero-${n}`,
  src: `/images/hero/hero-${n}.webp`,
  alt: `BAYADA 홈헬스케어 서비스 ${n}`,
  title: TITLE,
  subtitle: SUBTITLE,
  ctaLabel: "서비스 찾기",
  ctaHref: "#services-by-age",
}));
