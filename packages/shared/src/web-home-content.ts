const numbers = [
  { value: 50, suffix: "+", label: "홈헬스케어 역사", labelKo: "년" },
  { value: 33000, suffix: "+", label: "글로벌 전문 인력", labelKo: "명" },
  { value: 360, suffix: "+", label: "글로벌 사무소", labelKo: "개" },
  { value: 24, suffix: "/7", label: "24시간 케어", labelKo: "" },
];

const features = [
  {
    icon: "/images/care-team/icons/book.svg",
    alt: "교육 아이콘",
    text: "고난도 시뮬레이션 실습실과 실제 상황 기반 교육",
  },
  {
    icon: "/images/care-team/icons/clipboard.svg",
    alt: "클립보드 아이콘",
    text: "신규 임상 인력을 위한 체계적인 간호사 레지던시 및 멘토링 프로그램",
  },
  {
    icon: "/images/care-team/icons/community.svg",
    alt: "커뮤니티 아이콘",
    text: "가족의 자신감과 안정을 높이는 가족 중심 교육",
  },
  {
    icon: "/images/care-team/icons/home-health.svg",
    alt: "홈헬스 아이콘",
    text: "철저한 응급 대응 준비 및 안전 프로토콜 운영",
  },
];

const certifications = [
  { name: "ANCC Accredited Provider", src: "/images/awards/ancc.png" },
  { name: "CARF Accredited", src: "/images/awards/carf.png" },
  { name: "CHAP Standards of Excellence", src: "/images/awards/chap.png" },
  { name: "Home Care Pulse Certified", src: "/images/awards/hcp.png" },
  { name: "Hospice Honors Elite", src: "/images/awards/hospice-honors.png" },
];

export const WEB_HOME_DEFAULTS = { numbers, features, certifications };
