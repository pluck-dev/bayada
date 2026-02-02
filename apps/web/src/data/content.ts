import enrichedContent from "../../../../data/_enriched-content.json";

// 타입 정의
export interface PricingRow {
  duration: string;
  selfPay15: number;
  nhis85: number;
  total: number;
}

export interface MonthlyLimitRow {
  grade: string;
  limit: number;
}

export interface UsageStep {
  step: number;
  title: string;
  description: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface CoreValueDetail {
  goal: string;
  activities: string[];
}

export interface CompanyInfo {
  legalName: string;
  ceo: string;
  businessRegistrationNo: string;
  headquarters: string;
  careCenter: string;
  tel: string;
  fax: string;
  email: string;
  recruitEmail: string;
  serviceHotline: string;
  blog: string;
  globalSites: Record<string, string | boolean>;
  relatedSites: string[];
  partners: string[];
}

export interface Navigation {
  [key: string]: string | Record<string, string>;
}

// 데이터 접근 함수
const data = enrichedContent as typeof enrichedContent;

export function getPageContent<K extends keyof typeof data.pages>(key: K) {
  return data.pages[key];
}

export function getCompanyInfo(): CompanyInfo {
  return data.companyInfo as CompanyInfo;
}

export function getNavigation(): Navigation {
  return data.navigation as Navigation;
}

export function getHomepage() {
  return data.pages.homepage;
}

export function getCEOContent() {
  return data.pages.ceo;
}

export function getAboutContent() {
  return data.pages.aboutus;
}

export function getBayadaWayContent() {
  return data.pages["the-bayada-way"];
}

export function getCenterContent() {
  return data.pages.centerus;
}

export function getHomeCareContent() {
  return data.pages["visit-medical-care"];
}

export function getVisitingNursingContent() {
  return data.pages["visiting-nursing"];
}

export function getDementiaCareContent() {
  return data.pages["dementia-care"];
}

export function getCareCoordinatorContent() {
  return data.pages["care-coordinator"];
}

export function getCustomExerciseContent() {
  return data.pages["custom-exercise"];
}

export function getMusicTherapyContent() {
  return data.pages["music-therapy"];
}

export function getCognitiveTherapyContent() {
  return data.pages["cognitive-therapy"];
}

export function getUsageGuideContent() {
  return data.pages["usage-guide"];
}

export function getConsultationContent() {
  return data.pages["service-consultation"];
}

export function getFAQContent() {
  return data.pages.faq;
}

export function getPrivacyContent() {
  return data.pages["privacy-policy"];
}

// 서비스 목록 (네비게이션/개요용)
export function getAllServices() {
  return [
    {
      key: "home-care",
      title: "방문요양",
      subtitle: "케어 기버",
      description: data.pages["visit-medical-care"].description,
      image: "/images/services/home-care.jpg",
      href: "/services/home-care",
    },
    {
      key: "visiting-nursing",
      title: "방문간호",
      subtitle: "케어 메이트",
      description: data.pages["visiting-nursing"].description,
      image: "/images/services/visiting-nursing.jpg",
      href: "/services/visiting-nursing",
    },
    {
      key: "dementia-care",
      title: "치매케어",
      subtitle: "",
      description: data.pages["dementia-care"].description,
      image: "/images/services/dementia-care.jpg",
      href: "/services/dementia-care",
    },
    {
      key: "care-coordinator",
      title: "케어코디",
      subtitle: "맞춤형 건강관리",
      description: data.pages["care-coordinator"].description,
      image: "/images/services/care-coordinator.jpg",
      href: "/services/care-coordinator",
    },
    {
      key: "custom-exercise",
      title: "맞춤운동",
      subtitle: "",
      description: data.pages["custom-exercise"].description,
      image: "/images/services/custom-exercise.jpg",
      href: "/services/custom-exercise",
    },
    {
      key: "music-therapy",
      title: "음악요법",
      subtitle: "",
      description: data.pages["music-therapy"].description,
      image: "/images/services/music-therapy.jpg",
      href: "/services/music-therapy",
    },
    {
      key: "cognitive-therapy",
      title: "통합인지요법",
      subtitle: "",
      description: data.pages["cognitive-therapy"].description,
      image: "/images/services/cognitive-therapy.jpg",
      href: "/services/cognitive-therapy",
    },
  ];
}

// 파트너 로고 목록
export function getPartnerLogos() {
  return [
    { name: "Pfizer", image: "/images/partners/Pfizer.png" },
    { name: "한국다발성경화증협회", image: "/images/partners/한국다발성경화증협회.png" },
    { name: "한양대학교", image: "/images/partners/한양대학교.png" },
    { name: "한국복합부위통증증후군환우회", image: "/images/partners/한국복합부위통증증후군환우회.png" },
    { name: "Fortrea", image: "/images/partners/Fortrea.png" },
    { name: "Accellacare", image: "/images/partners/Accellacare.png" },
    { name: "EverEx", image: "/images/partners/EverEx.png" },
    { name: "kakao healthcare", image: "/images/partners/kakao-healthcare.png" },
    { name: "당뇨병학연구재단", image: "/images/partners/당뇨병학연구재단.png" },
    { name: "세브란스병원", image: "/images/partners/세브란스병원.png" },
    { name: "가톨릭대학교 서울성모병원", image: "/images/partners/가톨릭대학교-서울성모병원.png" },
    { name: "고려대학교의료원", image: "/images/partners/고려대학교의료원.png" },
    { name: "서울대학교병원", image: "/images/partners/서울대학교병원.png" },
    { name: "강남조은눈안과", image: "/images/partners/강남조은눈안과.png" },
    { name: "서울36의원", image: "/images/partners/서울36의원.png" },
    { name: "양산부산대학교병원", image: "/images/partners/양산부산대학교병원.png" },
    { name: "Roche", image: "/images/partners/Roche.png" },
    { name: "abbvie", image: "/images/partners/abbvie.png" },
    { name: "Alvogen", image: "/images/partners/Alvogen.png" },
    { name: "novo nordisk", image: "/images/partners/novo-nordisk.png" },
    { name: "Eisai", image: "/images/partners/Eisai.png" },
    { name: "Corestem chemon", image: "/images/partners/Corestem-Chemon.png" },
    { name: "Labcorp", image: "/images/partners/labcorp.png" },
    { name: "가야할길", image: "/images/partners/가야할길.png" },
  ];
}
