import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// 카테고리 데이터
const categories = [
  { name: "방문 간호 Class", slug: "visiting-nurse" },
  { name: "공통교육", slug: "common" },
  { name: "PSP Class", slug: "psp" },
  { name: "방문 요양 Class", slug: "visiting-care" },
];

// 강의 데이터 (bestcareacademy.com에서 수집)
const coursesData = [
  {
    title: "Guidelines for the Response to Human Rights Violations_A(2026)",
    slug: "guidelines-for-the-response-to-human-rights-violations_a2026",
    description: "방문간호 업무에 있어 필요한 인권침해 대응지침을 배울 수 있습니다",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/인권침해대응지침-A_썸네일-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "인권침해대응지침_A(2026)", duration: "12분 08초" },
      { title: "퀴즈_인권침해대응지침_A(2026)", isQuiz: true },
    ],
  },
  {
    title: "Privacy Guidelines (2026)",
    slug: "privacy-guidelines-2026",
    description: "방문간호 업무에 있어 필요한 개인정보보호 기본지침과 관리 방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/개인정보보호지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "개인정보 보호지침(2026)", duration: "4분50초" },
      { title: "퀴즈_개인정보 보호지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for Prevention of Musculoskeletal Diseases (2026)",
    slug: "guidelines-for-prevention-of-musculoskeletal-diseases-2026",
    description: "근골격계질환 예방의 중요성을 알고, 질환의 원인과 대처방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/근골격계질환예방지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "근골격계질환 예방지침(2026)", duration: "7분 28초" },
      { title: "퀴즈_근골격계질환 예방지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for Fall Prevention and Management (2026)",
    slug: "guidelines-for-fall-prevention-and-management-2026",
    description: "낙상예방의 중요성을 알고, 낙상예방법과 함께 낙상 발생시 대처방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/낙상예방및관리지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "낙상예방 및 관리지침(2026)", duration: "9분 53초" },
      { title: "퀴즈_낙상예방 및 관리지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for the prevention and management of Pressure Ulcer (2026)",
    slug: "guidelines-for-the-prevention-and-management-of-pressure-ulcer-2026",
    description: "욕창 예방의 중요성을 알고, 예방을 위한 간호와 욕창발생시에 따른 관리방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/욕창예방및관리지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "욕창예방 및 관리지침_01(2026)", duration: "5분 38초" },
      { title: "욕창예방 및 관리지침_02(2026)", duration: "5분 18초" },
      { title: "퀴즈_욕창예방 및 관리지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Gudelines for dementia prevention intervention and care (2026)",
    slug: "gudelines-for-dementia-prevention-intervention-and-care-2026",
    description: "치매환자 방문간호를 위해 치매에 대한 최신 지견과 관리방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/치매예방및관리지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "치매예방 및 관리지침_01(2026)", duration: "9분 55초" },
      { title: "치매예방 및 관리지침_02(2026)", duration: "6분 07초" },
      { title: "치매예방 및 관리지침_03(2026)", duration: "5분 01초" },
      { title: "퀴즈_치매예방 및 관리지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for infection prevention and control (2026)",
    slug: "guidelines-for-infection-prevention-and-control-2026",
    description: "감염병 예방의 중요성을 알고, 예방을 위한 손씻기와 감염종류에 따른 관리방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/감염예방및관리지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "감염예방 및 관리지침(2026)", duration: "9분 28초" },
      { title: "퀴즈_감염예방 및 관리지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Emergency Response Guidelines (2026)",
    slug: "emergency-response-guidelines-2026",
    description: "응급상황의 종류를 알고, 응급상황 발생시 정확한 대처방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/응급상황대응지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "응급상황 대응지침_01(2026)", duration: "5분 58초" },
      { title: "응급상황 대응지침_02(2026)", duration: "5분 36초" },
      { title: "퀴즈_응급상황 대응지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for the Prevention and Response to Sexual Violence (2026)",
    slug: "guidelines-for-the-prevention-and-response-to-sexual-violence-2026",
    description: "성폭력 예방의 중요성, 유형과 규정의 이해를 바탕으로 실무에서 성폭력 예방 및 대응을 실천할 수 있는 방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/성폭력예방및대응지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "성폭력예방 및 대응지침(2026)", duration: "9분 6초" },
      { title: "퀴즈_성폭력예방 및 대응지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for Work Ethics(2026)",
    slug: "guidelines-for-work-ethics-2026",
    description: "방문간호 종사자로서 가져야 하는 윤리지침을 배우고, The BAYADA Way를 리마인드 할 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/종사자윤리지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "종사자 윤리지침(2026)", duration: "7분 31초" },
      { title: "퀴즈_종사자 윤리지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for the Protection of Human Rights for the Elderly (2026)",
    slug: "guidelines-for-the-protection-of-human-rights-for-the-elderly-2026",
    description: "고령화시대를 맞아 노인대상자를 위한 인권보호과 노인학대 예방 및 발생시 대처방법을 배울 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2026/01/노인인권보호지침-480x380.png",
    category: "방문 간호 Class",
    lectures: [
      { title: "노인인권 보호지침(2026)", duration: "10분 44초" },
      { title: "퀴즈_노인인권 보호지침(2026)", isQuiz: true },
    ],
  },
  {
    title: "Information Security",
    slug: "information-security",
    description: "본 교육은 Information Security 를 이해하고, 학습을 통하여 업무의 안전성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2025/12/Information-Security-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "Information Security", duration: "5분 57초" },
      { title: "Data Protection_01", duration: "8분 39초" },
      { title: "Data Protection_02", duration: "8분 45초" },
      { title: "BCP", duration: "11분 21초" },
      { title: "퀴즈_Information Security", isQuiz: true },
    ],
  },
  {
    title: "BAYADA Compliance Program",
    slug: "bayada-compliance-program",
    description: "'바야다홈헬스케어의 정직과 기밀 유지의 표준'(Our Standards of Honesty & Confidentiality)을 알고, Compliance Program을 이수하여 업무 수행 시 컴플라이언스를 실행할 수 있습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2024/11/BAYADA-Compliance-program-썸네일-min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "BAYADA Compliance Program", duration: "22분 51초" },
      { title: "퀴즈_BAYADA Compliance Program", isQuiz: true },
    ],
  },
  {
    title: "입사교육_감염관리B",
    slug: "employment-training-infectious-infection-control-b",
    description: "정확한 감염관리 방법을 익히고 실천할 수 있다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2024/07/입사교육_감염관리_B_썸네일-min-1-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "입사교육_감염관리_B", duration: "11분 5초" },
      { title: "퀴즈_입사교육_감염관리_B", isQuiz: true },
    ],
  },
  {
    title: "입사교육_감염관리A",
    slug: "employment-training-infectious-infection-control-a",
    description: "정확한 감염관리 방법을 익히고 실천할 수 있다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2024/07/입사교육_감염관리_A_썸네일-min-1-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "입사교육_감염관리_A", duration: "15분 5초" },
      { title: "퀴즈_입사교육_감염관리_A", isQuiz: true },
    ],
  },
  {
    title: "손위생_손씻기",
    slug: "hand-hygiene-wash-your-hands",
    description: "본 교육은 손씻기 방법을 학습하여 감염관리를 위한 손위생을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2024/05/손위생_손씻기_썸네일-min-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "신규직원교육_5 손위생_손씻기", duration: "5분 39초" },
      { title: "퀴즈_손위생_손씻기", isQuiz: true },
    ],
  },
  {
    title: "Guidelines for the Response to Human Rights Violations_B",
    slug: "guidelines-for-the-response-to-human-rights-violations-b",
    description: "방문간호 업무에 있어 필요한 인권침해 대응지침을 배울 수 있습니다",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2024/03/인권침해대응지침_B_-썸네일-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "인권침해대응지침_B", duration: "11분 34초" },
      { title: "퀴즈_인권침해대응지침_B", isQuiz: true },
    ],
  },
  {
    title: "필드직원 지출결의서 작성 매뉴얼",
    slug: "field-employee-expense-report-manual",
    description: "본 교육은 필드직원 지출결의서 작성방법을 학습하여 직원의 관련 업무 능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/썸네일_필드직원-지출결의서-작성-매뉴얼-min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "필드직원 지출결의서 작성 매뉴얼", duration: "9분 56초" },
      { title: "퀴즈_필드직원 지출결의서 작성 매뉴얼", isQuiz: true },
    ],
  },
  {
    title: "상근직 지출결의서 작성 매뉴얼",
    slug: "regular-employee-expense-report-manual",
    description: "본 교육은 상근직 지출결의서 작성방법을 학습하여 직원의 관련 업무 능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/상근직-지출결의서-작성-매뉴얼_min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "상근직 지출결의서 작성 매뉴얼", duration: null },
      { title: "퀴즈_상근직 지출결의서 작성 매뉴얼", isQuiz: true },
    ],
  },
  {
    title: "응급상황대처 및 사건사고 보고서B",
    slug: "emergency-response-and-incident-report-b",
    description: "본 교육은 회사 업무 중 응급상황에 대한 대처법을 학습하여 직원의 업무능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/응급상황대처-및-사건사고-보고서B_min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "응급상황대처 및 사건사고 보고서B", duration: "1분 55초" },
      { title: "퀴즈_응급상황대처 및 사건사고 보고서 B", isQuiz: true },
    ],
  },
  {
    title: "응급상황대처 및 사건사고 보고서A",
    slug: "emergency-response-and-incident-report-a",
    description: "본 교육은 회사 업무 중 응급상황에 대한 대처법을 학습하여 직원의 업무능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/응급상황대처-및-사건사고-보고서A_min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "응급상황대처 및 사건사고 보고서 A", duration: "1분 47초" },
      { title: "퀴즈_응급상황대처 및 사건사고 보고서 A", isQuiz: true },
    ],
  },
  {
    title: "방문가방 및 모바일 사용법",
    slug: "visit-bag-and-mobile-usage",
    description: "본 교육은 방문가방 및 모바일 사용법을 학습하여 직원의 업무능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/방문가방-및-모바일-사용법_min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "방문가방 및 모바일 사용법", duration: "3분 33초" },
      { title: "퀴즈_방문가방 및 모바일 사용법", isQuiz: true },
    ],
  },
  {
    title: "Data Protection",
    slug: "data-protection",
    description: "본 교육은 Data Protection의 정의을 이해하고, 실천수칙 학습을 통하여 업무의 안전성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/07/Data-Protection-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "Data Protection_01", duration: "8분 39초" },
      { title: "Data Protection_02", duration: "8분 45초" },
      { title: "퀴즈_Data Protection", isQuiz: true },
    ],
  },
  {
    title: "BAYADA SOP of Document Control and Management",
    slug: "bayada-sop-of-document-control-and-management",
    description: "본 교육은 문서관리표준운영절차 REV5.0을 학습하여 직원의 업무능력 향상을 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/06/2023.06.28_문서관리표준운영절차-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "문서관리표준운영절차 REV5.0", duration: "21분 43초" },
      { title: "퀴즈_문서관리표준운영절차", isQuiz: true },
    ],
  },
  {
    title: "BCP(Business Continuity Plan)",
    slug: "bcp-business-continuity-plan",
    description: "본 교육은 BCP의 정의와 중요성을 확인하고, BAYADA BCP를 인지하여 업무의 안정성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/06/업무연속성계획BCP-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "BCP", duration: "11분 21초" },
      { title: "퀴즈_업무연속성계획(BCP)", isQuiz: true },
    ],
  },
  {
    title: "Parkinson's Disease",
    slug: "parkinsons-disease",
    description: "본 교육은 파킨슨의 원인과 진단 및 다양한 증상을 이해하고, 질환의 치료법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/06/2023.6.2_파킨슨병-썸네일-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "파킨슨병(Parkinson's disease)_01", duration: null, type: "TEXT" },
      { title: "파킨슨병(Parkinson's disease)_02", duration: null, type: "TEXT" },
      { title: "파킨슨병(Parkinson's disease)_03", duration: null, type: "TEXT" },
      { title: "퀴즈_파킨슨병", isQuiz: true },
    ],
  },
  {
    title: "Is it possible for everyone to have a happy service",
    slug: "is-it-possible-for-everyone-to-have-a-happy-service",
    description: "본 교육을 통해 서비스와 나, 고객에 대한 이해를 높이고, 바야다홈헬스케어가 지향하는 The BAYADA Way를 실천하고자 합니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/03/2023.3.3_모두가-행복한-서비스는-가능한가_썸네일-min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "01 서비스란 무엇인가", duration: "22분 09초" },
      { title: "02 서비스 하는 '나'는 누구인가", duration: "17분 31초" },
      { title: "03 서비스를 받는 고객은 누구인가", duration: "19분 43초" },
      { title: "퀴즈_모두가 행복한 서비스는 가능한가", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Hemophilia(REV1.0)",
    slug: "disease-education-hemophilia",
    description: "본 교육은 혈우병의 원인과 진단 및 다양한 증상을 이해하고, 질환의 치료법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/01/20230118_질환교육-혈우병-min-480x380.png",
    category: "PSP Class",
    lectures: [
      { title: "혈우병(Hemophilia)_01", duration: "14분 14초" },
      { title: "혈우병(Hemophilia)_02", duration: "13분 27초" },
      { title: "혈우병(Hemophilia)_03", duration: "12분 45초" },
      { title: "퀴즈_혈우병", isQuiz: true },
    ],
  },
  {
    title: "Overseas Empirical Practice of Home Health Care",
    slug: "overseas-empirical-practice-of-home-health-care",
    description: "본 교육을 통해 일본과 미국의 해외재택의료에 대한 이해를 높이고, 바야다홈헬스케어가 지향하는 재택의료와 연결성을 배우고자 합니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2023/01/20230105_바야다_해외-재택의료의-실제_일본-미국-재택투석-사례-중심으로-min-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "01 일본의 재택투석치료의 현황", duration: "24분 25초" },
      { title: "02 미국 외 해외 재택투석치료와 한국 재택투석치료의 가능성", duration: "27분" },
      { title: "퀴즈_해외 재택의료의 실제", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Hidradenitis Suppurativa(Basic)",
    slug: "disease-education-hidradenitis-suppurativa",
    description: "본 교육은 화농성 한선염의 원인과 진단을 이해하고, 증상에 따른 다양한 치료 방법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/12/질환교육-화농성-한선염_썸네일-min-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "화농성한선염_01", duration: "15분 10초" },
      { title: "퀴즈_화농성 한선염", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Becchett Enteritis",
    slug: "disease-education-becchett-enteritis",
    description: "본 교육은 베체트병 및 베체트장염의 원인과 진단을 이해하고, 증상에 따른 다양한 치료 방법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/11/2022.11.4_질환교육_베체트장염-썸네일-480x380.png",
    category: "PSP Class",
    lectures: [
      { title: "베체트장염_01 베체트병이란", duration: "11분 36초" },
      { title: "베체트장염_02 베체트장염의 진단과 치료", duration: "14분" },
      { title: "퀴즈_베체트장염", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: ankylosing spondylitis(REV1.0)",
    slug: "disease-education-ankylosing-spondylitis",
    description: "본 교육은 강직척추염의 원인과 진단을 이해하고, 증상에 따른 다양한 치료 방법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/10/20221011_질환교육-강직척추염_썸네일-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "강직척추염(AS)_01 질환의 원인 및 증상", duration: "9분 8초" },
      { title: "강직척추염(AS)_02 질환의 진단, 검사 및 치료", duration: "8분 55초" },
      { title: "퀴즈_강직척추염", isQuiz: true },
    ],
  },
  {
    title: "Medical care in Home Health Care",
    slug: "medical-care-in-home-health-care",
    description: "본 교육을 통해 재택의료에서의 방문진료에 대한 이해를 높이고, 바야다홈헬스케어가 지향하는 재택의료와 연결성을 배우고자 합니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/09/20220927_재택의료에서의-방문진료_썸네일-min-480x380.png",
    category: "공통교육",
    lectures: [
      { title: "01 '건강의집'의원 소개, 우리나라 방문진료의 현황", duration: "19분 36초" },
      { title: "02 '건강의집' 방문진료의윈 운영경험", duration: "11분 59초" },
      { title: "03 외국 재택의료 운영사례 및 방문진료 전문의원 필요성", duration: "9분 38초" },
      { title: "04 재택의료에서의 방문진료 Q&A", duration: "18분 6초" },
      { title: "퀴즈_재택의료에서의 방문진료", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Uveitis(REV1.0)",
    slug: "disease-education-uveitis",
    description: "본 교육은 포도막염의 원인과 진단을 이해하고, 증상에 따른 다양한 치료 방법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/08/바야다_질환교육_포도막염_썸네일-min-480x380.png",
    category: "PSP Class",
    lectures: [
      { title: "질환교육_포도막염(Uveitis)", duration: "13분 59초" },
      { title: "퀴즈_포도막염", isQuiz: true },
    ],
  },
  {
    title: "Office365사용법(Web, Mobile)",
    slug: "office365-usage-web-mobile",
    description: "본 교육은 Office365사용법(Web, Mobile) 이해하고, 활용법 실습을 통하여 업무의 효율성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/08/Office365사용법Web-Mobile-min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "Office365사용법(Web, Mobile)", duration: "4분 47초" },
      { title: "퀴즈_ Office365사용법(Web, Mobile)", isQuiz: true },
    ],
  },
  {
    title: "Office365사용법(Application) / SharePoint, 전자결재",
    slug: "office365-usage-application-sharepoint",
    description: "본 교육은 Office365사용법(Application) / SharePoint, 전자결재를 이해하고, 활용법 실습을 통하여 업무의 효율성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/08/Office365사용법Application-SharePoint-전자결재-min-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "Office365사용법(Application) / SharePoint, 전자결재", duration: "8분 19초" },
      { title: "퀴즈_ Office365사용법(Application) / SharePoint, 전자결재", isQuiz: true },
    ],
  },
  {
    title: "How to use SharePoint for Data Safety",
    slug: "how-to-use-sharepoint-for-data-safety",
    description: "본 교육은 SharePoint의 기능을 이해하고, 활용법 실습을 통하여 업무의 효율성을 높일 수 있는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/08/SharePoint_Training_2022-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "Data Safety_SharePoint 사용법", duration: "10분 56초" },
      { title: "퀴즈_Data Safety_SharePoint 사용법", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Complex Regional Pain Syndrome",
    slug: "disease-education-complex-regional-pain-syndrome",
    description: "본 교육은 복합부위통증증후군의 진단과 치료를 이해하고, 한국복합부위통증증후군환우회 활동을 통해 환자이해를 가지는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/07/20220728_질환교육_복합부위통증증후군_썸네일-min-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "복합부위통증증후군(CRPS)_2021 4Q BAYADA univ.", duration: "13분 26초" },
      { title: "퀴즈_복합부위통증증후군", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Inflammatory Bowel Disease",
    slug: "disease-education-inflammatory-bowel-disease",
    description: "본 교육은 염증성 장질환의 진단과 치료를 이해하고, 궤양성 대장염, 크론 및 소아 크론병의 특성과 함께 환자생활관리를 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/07/질환교육_염증성-장질환_썸네일-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "염증성 장질환(IBD)_01 IBD의 정의부터 증상 및 합병증까지", duration: "8분 36초" },
      { title: "염증성 장질환(IBD)_02 궤양성 대장염과 크론병", duration: "11분 6초" },
      { title: "염증성 장질환(IBD)_03 IBD의 치료, 식이관리 및 일상생활관리", duration: "13분 43초" },
      { title: "염증성 장질환(IBD)_04 소아 크론병", duration: "6분 40초" },
      { title: "퀴즈_염증성 장질환", isQuiz: true },
    ],
  },
  {
    title: "BAYADA Transitional Care Model; the beginning of Korean Home Health Care",
    slug: "bayada-transitional-care-model",
    description: "본 교육을 통해 트랜지셔널 케어(Transitional Care)에 대한 이해를 높이고, 바야다홈헬스케어가 지향하는 트랜지셔널 케어를 배우고자 합니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/06/2022.6.29_한국형-재택-의료의-시작_-바야다-트렌지셔널-케어-모델-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "01 2022 바야다홈헬스케어의 현재", duration: "11분 18초" },
      { title: "02 한국형 재택의료의 허브_바야다홈헬스케어", duration: "08분 55초" },
      { title: "03 커뮤니티케어 시스템 내 바야다홈헬스케어의 역할", duration: "17분 05초" },
      { title: "04 트렌지셔널케어(전환의료/재택의료의 시작)", duration: "07분 04초" },
      { title: "05 Q&A_한국형 재택의료의 시작; 트렌지셔널 케어 모델", duration: "15분 10초" },
      { title: "퀴즈_한국형 재택의료의 시작; 트렌지셔널 케어 모델", isQuiz: true },
    ],
  },
  {
    title: "Training B after 1 year of employment",
    slug: "training-b-after-1-year-of-employment",
    description: "본 교육은 바야다홈헬스케어 입사 1년 후 교육으로 모든 직원의 업무능력 향상 및 BAYADA의 핵심가치인 Compassion, Excellence, Reliability를 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/06/20220602_입사-1년-후-교육B_썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "입사 1년 후 교육B_01 감염병관리", duration: "9분 52초" },
      { title: "입사 1년 후 교육B_02 주의유형지침", duration: "9분 4초" },
      { title: "입사 1년 후 교육B_03 결핵노출관리", duration: "8분 33초" },
    ],
  },
  {
    title: "Disease Education: Psoriasis Arthritis(REV1.0)",
    slug: "disease-education-psoriasis-arthritis",
    description: "본 교육은 건선관절염의 진단과 분류를 이해하고, 건선과 연결하여 질환의 치료를 이해하는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/05/20220531_질환교육_건성관절염_썸네일_v3-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "건선관절염(PsA)_01 질환의 정의 및 증상", duration: "12분 40초" },
      { title: "건선관절염(PsA)_02 질환의 치료 및 환자이해", duration: "12분 32초" },
      { title: "퀴즈_건선관절염", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Psoriasis(REV1.0)",
    slug: "disease-education-psoriasis",
    description: "본 교육은 건선의 진단과 분류를 이해하고, 건선 치료와 건선환자를 전인적으로 이해하는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/05/20220504_질환교육-건선psoriasis-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "건선(Psoriasis)_01 질환의 정의 및 현황", duration: "8분 16초" },
      { title: "건선(Psoriasis)_02 건선의 유형", duration: "9분 57초" },
      { title: "건선(Psoriasis)_03 건선의 치료", duration: "6분 26초" },
      { title: "건선(Psoriasis)_04 소아건선과 건선관리", duration: "9분 33초" },
      { title: "퀴즈_류마티스 관절염", isQuiz: true },
    ],
  },
  {
    title: "Training A after 1 year of employment",
    slug: "training-a-after-1-year-of-employment",
    description: "본 교육은 바야다홈헬스케어 입사 1년 후 교육으로 모든 직원의 업무능력 향상 및 BAYADA의 핵심가치인 Compassion, Excellence, Reliability를 실현할 수 있도록 돕습니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/04/2022.4.26_입사-1년-후-교육A-썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "입사 1년 후 교육A_01 감염병관리", duration: "12분 3초" },
      { title: "입사 1년 후 교육A_02 주의유형지침", duration: "9분 33초" },
      { title: "입사 1년 후 교육A_03 결핵노출관리", duration: "11분 40초" },
      { title: "퀴즈_입사 1년 후 교육A", isQuiz: true },
    ],
  },
  {
    title: "Disease Education: Rheumatoid Arthritis(REV1.0)",
    slug: "disease-education-rheumatoid-arthritis",
    description: "본 교육은 류마티스 관절염의 원인과 진단 및 다양한 증상을 이해하고, 질환의 치료법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/03/20220504_류마튜스_관절염_썸네일-480x380.jpg",
    category: "PSP Class",
    lectures: [
      { title: "류마티스 관절염(RA)_01", duration: "8분 49초" },
      { title: "류마티스 관절염(RA)_02", duration: "7분 26초" },
      { title: "류마티스 관절염(RA)_03", duration: "8분 02초" },
      { title: "퀴즈_류마티스 관절염", isQuiz: true },
    ],
  },
  {
    title: "Disease Education : Diabetes",
    slug: "disease-education-diabetes",
    description: "본 교육은 당뇨병의 진단과 분류를 이해하고, 자가혈당 측정법과 인슐린 주사법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/03/20220504_당뇨병_썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "당뇨병_01", duration: "5분 21초" },
      { title: "당뇨병_02", duration: "5분 43초" },
      { title: "당뇨병_03", duration: "4분 53초" },
      { title: "당뇨병_04 인슐린주사법(1)", duration: "9분 16초" },
      { title: "당뇨병_05 인슐린주사법(2)", duration: "8분 23초" },
      { title: "당뇨병_06 인슐린주사법(3)", duration: "3분 53초" },
      { title: "당뇨병_07 Q&A", duration: "7분 53초" },
      { title: "퀴즈_당뇨병", isQuiz: true },
    ],
  },
  {
    title: "Disease Education : Obesity",
    slug: "disease-education-obesity",
    description: "본 교육은 우리나라 국민의 체중관리 현황, 비만에 대한 전반적인 이론과 함께 원인을 이해하고, 비만의 동반질환과 치료법을 배우는 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/03/20220504_비만_썸네일-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "비만(Obesity)_01", duration: "4분 17초" },
      { title: "비만(Obesity)_02", duration: "6분" },
      { title: "비만(Obesity)_03", duration: "8분 1초" },
      { title: "비만(Obesity)_04", duration: "7분 2초" },
      { title: "퀴즈_비만(Obesity)", isQuiz: true },
    ],
  },
  {
    title: "Using the CIST and MBI Assessment Tool",
    slug: "using-the-cist-and-mbi-assessment-tool",
    description: "본 교육은 인지기능 및 기동성 평가 도구인 CIST와 MBI에 대한 교육입니다.",
    thumbnail: "https://bestcareacademy.com/wp-content/uploads/2022/02/2022.2.9_CIST-와-MBI-평가-도구-사용법-썸네일-1-480x380.jpg",
    category: "공통교육",
    lectures: [
      { title: "CIST 와 MBI 평가 도구 사용법_01 CIST 검사", duration: null },
      { title: "CIST 와 MBI 평가 도구 사용법_02 MBI 검사, Q&A", duration: null },
      { title: "퀴즈_CIST 와 MBI 평가 도구 사용법", isQuiz: true },
    ],
  },
];

// 시간 문자열을 초 단위로 변환
function parseDuration(dur: string | null | undefined): number | null {
  if (!dur) return null;
  // "영상교육", "텍스트 수업" 등은 null
  if (dur.includes("교육") || dur.includes("수업")) return null;

  let totalSeconds = 0;
  const minMatch = dur.match(/(\d+)분/);
  const secMatch = dur.match(/(\d+)초/);
  if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60;
  if (secMatch) totalSeconds += parseInt(secMatch[1]);
  return totalSeconds || null;
}

async function main() {
  console.log("🗑️  기존 데이터 삭제...");
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 테스트 유저 생성
  console.log("👤 테스트 유저 생성...");
  const pw = await hash("password123", 12);
  await prisma.user.create({
    data: { email: "admin@bayada.com", name: "관리자", password: pw, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { email: "student@bayada.com", name: "홍길동", password: pw, role: "STUDENT", phone: "010-1234-5678" },
  });
  console.log("   ✅ admin@bayada.com / student@bayada.com (비밀번호: password123)");

  console.log("📁 카테고리 생성...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.name] = created.id;
  }
  console.log(`   ✅ ${categories.length}개 카테고리 생성`);

  console.log("📚 강의 + 섹션 + 레슨 생성...");
  let courseCount = 0;
  let lectureCount = 0;

  for (const courseData of coursesData) {
    const categoryId = courseData.category
      ? categoryMap[courseData.category]
      : null;

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        price: 0,
        status: "PUBLISHED",
        categoryId: categoryId || null,
        sections: {
          create: {
            title: "기본 교육과정",
            order: 1,
            lectures: {
              create: courseData.lectures
                .filter((l) => !l.isQuiz)
                .map((lecture, idx) => ({
                  title: lecture.title,
                  order: idx + 1,
                  type: (lecture as any).type === "TEXT" ? "TEXT" as const : "VIDEO" as const,
                  duration: parseDuration(lecture.duration),
                  isFree: true,
                })),
            },
          },
        },
      },
    });

    const videoLectures = courseData.lectures.filter((l) => !l.isQuiz);
    courseCount++;
    lectureCount += videoLectures.length;
    console.log(
      `   [${courseCount}/${coursesData.length}] ${courseData.title} (${videoLectures.length}개 레슨)`
    );
  }

  console.log("\n🎉 시드 완료!");
  console.log(`   - 카테고리: ${categories.length}개`);
  console.log(`   - 강의: ${courseCount}개`);
  console.log(`   - 레슨: ${lectureCount}개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
