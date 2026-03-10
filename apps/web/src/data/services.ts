import type { ServiceData } from "@/types";

// 12가지 홈헬스케어 서비스 (FR-W-005)
export const services: ServiceData[] = [
  {
    slug: "skilled-nursing",
    nameEn: "Skilled Nursing",
    nameKo: "전문 방문 간호",
    description:
      "전문 간호사가 가정을 방문하여 전문적인 간호 서비스를 제공합니다. 상처 관리, 투약 관리, 건강 상태 모니터링 등 의료적 케어를 받으실 수 있습니다.",
    icon: "🏥",
    image: "/images/services/skilled-nursing.jpg",
    href: "/what-we-do/skilled-nursing",
    highlights: [
      "전문 간호사의 가정 방문",
      "상처 및 투약 관리",
      "건강 상태 모니터링",
      "의사 지시에 따른 간호 수행",
    ],
    targetAudience: ["시니어", "만성질환 환자", "수술 후 회복 환자"],
    process: [
      { step: 1, title: "상담 신청", description: "전화 또는 온라인으로 상담을 신청합니다" },
      { step: 2, title: "건강 평가", description: "전문 간호사가 방문하여 건강 상태를 평가합니다" },
      { step: 3, title: "케어 플랜 수립", description: "개인 맞춤 간호 계획을 수립합니다" },
      { step: 4, title: "서비스 시작", description: "정기적인 방문 간호 서비스를 시작합니다" },
    ],
    relatedServices: ["private-assistive-care", "transitional-care", "long-term-care"],
  },
  {
    slug: "private-assistive-care",
    nameEn: "Private Assistive Care",
    nameKo: "맞춤형 방문 요양",
    description:
      "개인 맞춤 요양 보호 서비스를 제공합니다. 일상생활 지원, 개인 위생 관리, 식사 준비, 외출 동행 등 생활 전반의 돌봄을 받으실 수 있습니다.",
    icon: "🤝",
    image: "/images/services/private-assistive-care.jpg",
    href: "/what-we-do/private-assistive-care",
    highlights: [
      "일상생활 전반 지원",
      "개인 위생 및 식사 관리",
      "외출 동행 서비스",
      "정서적 지지 및 말벗",
    ],
    targetAudience: ["시니어", "거동 불편자", "독거 어르신"],
    process: [
      { step: 1, title: "상담 신청", description: "필요한 서비스를 상담합니다" },
      { step: 2, title: "맞춤 매칭", description: "고객에게 적합한 요양보호사를 매칭합니다" },
      { step: 3, title: "서비스 시작", description: "정해진 일정에 따라 방문 요양을 시작합니다" },
      { step: 4, title: "정기 모니터링", description: "서비스 품질을 지속적으로 관리합니다" },
    ],
    relatedServices: ["skilled-nursing", "ltci-beneficiary-care", "senior-living"],
  },
  {
    slug: "hospice",
    nameEn: "Hospice",
    nameKo: "암환자 케어 (호스피스)",
    description:
      "말기 환자와 가족을 위한 완화 케어 서비스입니다. 통증 관리, 증상 완화, 정서적 지지, 가족 상담을 포함한 종합적 돌봄을 제공합니다.",
    icon: "💜",
    image: "/images/services/hospice.jpg",
    href: "/what-we-do/hospice",
    highlights: [
      "전문적 통증 관리",
      "증상 완화 케어",
      "환자 및 가족 정서 지원",
      "24시간 긴급 연락 체계",
    ],
    targetAudience: ["말기 환자", "암 환자", "환자 가족"],
    process: [
      { step: 1, title: "의뢰 접수", description: "의료기관 또는 가족이 호스피스 서비스를 의뢰합니다" },
      { step: 2, title: "초기 평가", description: "전문팀이 환자의 상태를 종합적으로 평가합니다" },
      { step: 3, title: "케어 플랜", description: "환자와 가족의 의견을 반영한 케어 플랜을 수립합니다" },
      { step: 4, title: "통합 돌봄", description: "다학제 팀이 통합적 돌봄을 제공합니다" },
    ],
    relatedServices: ["skilled-nursing", "patient-support", "long-term-care"],
  },
  {
    slug: "ltci-beneficiary-care",
    nameEn: "Long-term Care Insurance Beneficiary Care",
    nameKo: "노인장기요양보험 수급자 케어",
    description:
      "노인장기요양보험 수급자를 위한 종합 케어 서비스입니다. 방문간호, 방문요양, 방문목욕, 요양시설 서비스를 제공합니다.",
    icon: "🏠",
    image: "/images/services/ltci-care.jpg",
    href: "/what-we-do/ltci-beneficiary-care",
    highlights: [
      "장기요양보험 적용 서비스",
      "방문간호·방문요양·방문목욕",
      "요양시설 연계",
      "등급별 맞춤 케어",
    ],
    targetAudience: ["장기요양등급 판정자", "시니어", "수급자 가족"],
    process: [
      { step: 1, title: "등급 확인", description: "장기요양등급을 확인하거나 신청을 안내합니다" },
      { step: 2, title: "서비스 상담", description: "등급에 맞는 이용 가능 서비스를 안내합니다" },
      { step: 3, title: "케어 플랜", description: "개인별 맞춤 케어 플랜을 수립합니다" },
      { step: 4, title: "서비스 이용", description: "보험 적용 서비스를 이용합니다" },
    ],
    relatedServices: ["skilled-nursing", "private-assistive-care", "long-term-care"],
    subServices: [
      { name: "방문간호", description: "전문 간호사의 가정 방문 간호 서비스" },
      { name: "방문요양", description: "요양보호사의 가정 방문 돌봄 서비스" },
      { name: "방문목욕", description: "이동목욕차량을 이용한 가정 방문 목욕 서비스" },
      { name: "요양시설", description: "장기요양 시설 입소 서비스" },
    ],
  },
  {
    slug: "physical-trainer",
    nameEn: "Physical Trainer",
    nameKo: "맞춤형 방문 운동",
    description:
      "전문 트레이너가 가정을 방문하여 개인 맞춤 운동 프로그램을 제공합니다. 재활 운동, 낙상 예방, 근력 강화 등 목표에 맞는 운동을 지도합니다.",
    icon: "💪",
    image: "/images/services/physical-trainer.jpg",
    href: "/what-we-do/physical-trainer",
    highlights: [
      "전문 트레이너 가정 방문",
      "개인 맞춤 운동 프로그램",
      "재활 및 근력 강화",
      "낙상 예방 운동",
    ],
    targetAudience: ["시니어", "재활 환자", "만성질환 환자"],
    process: [
      { step: 1, title: "상담 신청", description: "운동 목표와 건강 상태를 상담합니다" },
      { step: 2, title: "체력 평가", description: "전문 트레이너가 체력과 운동 능력을 평가합니다" },
      { step: 3, title: "프로그램 설계", description: "개인 맞춤 운동 프로그램을 설계합니다" },
      { step: 4, title: "정기 방문 운동", description: "정해진 일정에 따라 운동을 지도합니다" },
    ],
    relatedServices: ["skilled-nursing", "senior-living", "ltci-beneficiary-care"],
  },
  {
    slug: "transitional-care",
    nameEn: "Transitional Care Program",
    nameKo: "전환의료",
    description:
      "병원에서 가정으로의 전환 시 연속적인 케어를 제공합니다. 퇴원 후 재입원을 예방하고 가정에서 안전하게 회복할 수 있도록 지원합니다.",
    icon: "🔄",
    image: "/images/services/transitional-care.jpg",
    href: "/what-we-do/transitional-care",
    highlights: [
      "병원→가정 연속 케어",
      "재입원 예방 프로그램",
      "퇴원 후 건강 관리",
      "의료기관 연계 서비스",
    ],
    targetAudience: ["퇴원 환자", "수술 후 환자", "의료기관"],
    process: [
      { step: 1, title: "퇴원 준비", description: "병원과 협력하여 퇴원 계획을 수립합니다" },
      { step: 2, title: "가정 환경 평가", description: "안전한 회복을 위해 가정 환경을 평가합니다" },
      { step: 3, title: "전환 케어", description: "퇴원 직후 집중 케어를 제공합니다" },
      { step: 4, title: "추적 관리", description: "회복 상태를 지속 모니터링합니다" },
    ],
    relatedServices: ["skilled-nursing", "hospice", "patient-support"],
    badge: "병원 연계",
  },
  {
    slug: "patient-support",
    nameEn: "Patient Support Program",
    nameKo: "환자지원프로그램",
    description:
      "제약사와 연계하여 환자의 치료 여정을 종합적으로 지원합니다. 약제비 지원, 환자 교육, 복약 관리, 건강 모니터링 등을 포함합니다.",
    icon: "💊",
    image: "/images/services/patient-support.jpg",
    href: "/what-we-do/patient-support",
    highlights: [
      "제약사 연계 환자 지원",
      "약제비 지원 안내",
      "복약 관리 및 교육",
      "치료 효과 모니터링",
    ],
    targetAudience: ["만성질환 환자", "희귀질환 환자", "제약사"],
    process: [
      { step: 1, title: "프로그램 등록", description: "지원 대상 확인 및 프로그램에 등록합니다" },
      { step: 2, title: "초기 교육", description: "질환 및 약물에 대한 교육을 실시합니다" },
      { step: 3, title: "정기 관리", description: "복약 관리와 건강 모니터링을 진행합니다" },
      { step: 4, title: "추적 평가", description: "치료 효과를 정기적으로 평가합니다" },
    ],
    relatedServices: ["skilled-nursing", "hospice", "dct"],
    badge: "제약사 연계",
  },
  {
    slug: "dct",
    nameEn: "Decentralized Clinical Trials",
    nameKo: "분산형 임상시험",
    description:
      "가정 기반 분산형 임상시험 서비스를 제공합니다. 참여자의 편의성을 높이고, 정확한 데이터 수집으로 임상시험의 질을 향상시킵니다.",
    icon: "🔬",
    image: "/images/services/dct.jpg",
    href: "/what-we-do/dct",
    highlights: [
      "가정 기반 임상시험",
      "참여자 편의성 극대화",
      "정확한 데이터 수집",
      "글로벌 임상 경험",
    ],
    targetAudience: ["제약사", "CRO", "임상시험 참여자"],
    process: [
      { step: 1, title: "프로토콜 검토", description: "임상시험 프로토콜을 검토합니다" },
      { step: 2, title: "인력 배치", description: "전문 간호 인력을 배치합니다" },
      { step: 3, title: "현장 수행", description: "가정에서 임상시험 절차를 수행합니다" },
      { step: 4, title: "데이터 관리", description: "수집된 데이터를 관리하고 보고합니다" },
    ],
    relatedServices: ["patient-support", "skilled-nursing", "mobile-clinical"],
  },
  {
    slug: "long-term-care",
    nameEn: "Long-term Care Services",
    nameKo: "노인장기요양서비스",
    description:
      "장기요양이 필요한 분들을 위한 통합 서비스입니다. 전문적이고 체계적인 장기 돌봄으로 삶의 질을 유지하실 수 있도록 지원합니다.",
    icon: "🏡",
    image: "/images/services/long-term-care.jpg",
    href: "/what-we-do/long-term-care",
    highlights: [
      "통합 장기요양 서비스",
      "전문 인력 배치",
      "품질 관리 시스템",
      "가족 지원 프로그램",
    ],
    targetAudience: ["시니어", "장기요양 필요자", "가족 보호자"],
    process: [
      { step: 1, title: "상담 및 평가", description: "필요한 서비스 범위를 상담하고 평가합니다" },
      { step: 2, title: "케어 플랜", description: "종합적인 케어 플랜을 수립합니다" },
      { step: 3, title: "서비스 제공", description: "전문 인력이 서비스를 제공합니다" },
      { step: 4, title: "품질 관리", description: "정기적으로 서비스 품질을 평가합니다" },
    ],
    relatedServices: ["ltci-beneficiary-care", "skilled-nursing", "private-assistive-care"],
  },
  {
    slug: "senior-living",
    nameEn: "Senior Living Solutions",
    nameKo: "시니어 리빙 솔루션",
    description:
      "시니어의 안전하고 편안한 생활을 위한 종합 솔루션입니다. 생활 환경 개선, 안전 설비, 스마트 홈 연동 등으로 자립 생활을 지원합니다.",
    icon: "🏠",
    image: "/images/services/senior-living.jpg",
    href: "/what-we-do/senior-living",
    highlights: [
      "시니어 맞춤 생활 솔루션",
      "안전 설비 및 환경 개선",
      "스마트 홈 연동",
      "교육 프로그램 연결",
    ],
    targetAudience: ["시니어", "독거 어르신", "시니어 가족"],
    process: [
      { step: 1, title: "환경 평가", description: "현재 생활 환경을 평가합니다" },
      { step: 2, title: "솔루션 설계", description: "맞춤형 리빙 솔루션을 설계합니다" },
      { step: 3, title: "설치 및 교육", description: "필요한 설비를 설치하고 사용법을 교육합니다" },
      { step: 4, title: "정기 점검", description: "정기적으로 환경을 점검합니다" },
    ],
    relatedServices: ["private-assistive-care", "physical-trainer", "long-term-care"],
    badge: "교육 연결",
  },
  {
    slug: "mobile-clinical",
    nameEn: "Mobile Clinical Service Consulting",
    nameKo: "모바일 클리니컬 서비스 컨설팅",
    description:
      "이동형 임상 서비스에 대한 전문 컨설팅을 제공합니다. 의료기관과 기업을 대상으로 모바일 임상 서비스 설계 및 운영을 지원합니다.",
    icon: "🚑",
    image: "/images/services/mobile-clinical.jpg",
    href: "/what-we-do/mobile-clinical",
    highlights: [
      "이동형 임상 서비스 설계",
      "운영 컨설팅",
      "인력 교육 및 배치",
      "품질 관리 체계 구축",
    ],
    targetAudience: ["의료기관", "제약사", "헬스케어 기업"],
    process: [
      { step: 1, title: "니즈 분석", description: "고객의 요구사항을 분석합니다" },
      { step: 2, title: "서비스 설계", description: "맞춤형 모바일 임상 서비스를 설계합니다" },
      { step: 3, title: "파일럿 운영", description: "시범 운영을 통해 검증합니다" },
      { step: 4, title: "본 운영", description: "본격적인 서비스를 운영합니다" },
    ],
    relatedServices: ["dct", "patient-support", "skilled-nursing"],
  },
  {
    slug: "education",
    nameEn: "Education",
    nameKo: "교육",
    description:
      "50년 BAYADA 노하우를 기반으로 한 전문 교육 서비스입니다. 제공자 전문 교육, 이용자 보호자 교육, 인증 교육 프로그램을 운영합니다.",
    icon: "📚",
    image: "/images/services/education.jpg",
    href: "/what-we-do/education",
    highlights: [
      "50년 BAYADA 교육 노하우",
      "제공자 전문 교육",
      "이용자·보호자 교육",
      "인증 교육 및 수료증 발급",
    ],
    targetAudience: ["의료 전문인", "요양보호사", "이용자 보호자"],
    process: [
      { step: 1, title: "과정 선택", description: "필요한 교육 과정을 선택합니다" },
      { step: 2, title: "수강 등록", description: "온라인 또는 오프라인 수강을 등록합니다" },
      { step: 3, title: "학습 진행", description: "체계적인 커리큘럼으로 학습합니다" },
      { step: 4, title: "수료 인증", description: "과정 완료 후 수료증을 발급받습니다" },
    ],
    relatedServices: ["skilled-nursing", "private-assistive-care", "senior-living"],
    badge: "DeiEdu 연결",
  },
  {
    slug: "home-health",
    nameEn: "Home Health",
    nameKo: "방문 건강관리",
    description:
      "의사 처방에 따라 전문 의료 인력이 가정을 방문하여 제공하는 전문 방문의료 서비스입니다. 간호, 물리치료, 작업치료, 언어치료 등 다학제적 접근으로 가정에서의 회복과 건강 유지를 지원합니다.",
    icon: "🏥",
    image: "/images/services/home-health.jpg",
    href: "/what-we-do/home-health",
    highlights: [
      "의사 처방 기반 전문 방문의료",
      "간호·물리·작업·언어치료 통합 제공",
      "개인 맞춤 케어 플랜 수립",
      "가정에서의 안전한 회복 지원",
    ],
    targetAudience: ["시니어", "만성질환 환자", "수술 후 회복 환자"],
    process: [
      { step: 1, title: "의뢰 접수", description: "의사 또는 의료기관이 방문 건강관리를 의뢰합니다" },
      { step: 2, title: "초기 평가", description: "전문 간호사가 가정을 방문하여 건강 상태를 평가합니다" },
      { step: 3, title: "케어 플랜 수립", description: "다학제 팀이 개인 맞춤 케어 플랜을 수립합니다" },
      { step: 4, title: "서비스 시작", description: "처방에 따라 정기적인 방문 의료 서비스를 시작합니다" },
    ],
    relatedServices: ["skilled-nursing", "transitional-care", "private-duty-nursing"],
  },
  {
    slug: "personal-care",
    nameEn: "Personal Care",
    nameKo: "일상생활 지원",
    description:
      "옷 입기, 세면, 목욕, 이동 등 일상생활 전반을 전문 케어 제공자가 지원하는 서비스입니다. 어르신과 장애인이 가정에서 존엄성을 유지하며 자립적인 생활을 영위할 수 있도록 돕습니다.",
    icon: "🤲",
    image: "/images/services/personal-care.jpg",
    href: "/what-we-do/personal-care",
    highlights: [
      "개인 위생 및 목욕 지원",
      "옷 입기·이동 보조",
      "식사 준비 및 영양 관리",
      "존엄성 중심의 돌봄 철학",
    ],
    targetAudience: ["시니어", "장애인", "거동 불편자"],
    process: [
      { step: 1, title: "상담 신청", description: "필요한 일상생활 지원 항목을 상담합니다" },
      { step: 2, title: "케어 평가", description: "전문 코디네이터가 지원 필요 수준을 평가합니다" },
      { step: 3, title: "케어 제공자 매칭", description: "적합한 케어 제공자를 매칭합니다" },
      { step: 4, title: "서비스 시작", description: "일정에 따라 일상생활 지원 서비스를 시작합니다" },
    ],
    relatedServices: ["companion-care", "private-assistive-care", "home-health"],
  },
  {
    slug: "habilitation",
    nameEn: "Habilitation",
    nameKo: "기능향상 훈련",
    description:
      "지적장애·발달장애인이 가정과 지역사회에서 더 독립적으로 생활할 수 있도록 지원하는 가정 기반 기능향상 훈련 서비스입니다. 일상생활 기술, 사회적 기술, 지역사회 통합을 목표로 개별화된 훈련 프로그램을 제공합니다.",
    icon: "🌱",
    image: "/images/services/habilitation.jpg",
    href: "/what-we-do/habilitation",
    highlights: [
      "지적·발달 장애인 가정 기반 지원",
      "일상생활 기술 훈련",
      "지역사회 통합 프로그램",
      "개별화된 훈련 계획 수립",
    ],
    targetAudience: ["지적장애인", "발달장애인", "장애인 가족"],
    process: [
      { step: 1, title: "상담 신청", description: "훈련 목표와 필요 사항을 상담합니다" },
      { step: 2, title: "기능 평가", description: "현재 기능 수준과 필요를 종합적으로 평가합니다" },
      { step: 3, title: "훈련 계획 수립", description: "개별화된 기능향상 훈련 계획을 수립합니다" },
      { step: 4, title: "훈련 시작", description: "가정과 지역사회에서 훈련을 시작합니다" },
    ],
    relatedServices: ["aba-therapy", "personal-care", "companion-care"],
  },
  {
    slug: "pediatric-home-health",
    nameEn: "Pediatric Home Health",
    nameKo: "소아 방문 건강관리",
    description:
      "일상적인 돌봄부터 HICU(가정 집중치료) 수준의 고도 간호까지, 복잡한 의료 필요를 가진 아동을 위한 전문 소아 방문 건강관리 서비스입니다. 아동이 가정에서 안전하게 성장할 수 있도록 전문 소아 간호팀이 지원합니다.",
    icon: "👶",
    image: "/images/services/pediatric-home-health.jpg",
    href: "/what-we-do/pediatric-home-health",
    highlights: [
      "소아 전문 방문 간호팀",
      "일반 돌봄부터 HICU 수준 고도 간호",
      "의료 기기 관리 전문성",
      "가족 교육 및 정서 지원",
    ],
    targetAudience: ["복잡한 의료 필요 아동", "미숙아·신생아", "아동 가족"],
    process: [
      { step: 1, title: "의뢰 접수", description: "의사 또는 병원이 소아 방문 건강관리를 의뢰합니다" },
      { step: 2, title: "소아 평가", description: "소아 전문 간호사가 아동의 의료 필요를 평가합니다" },
      { step: 3, title: "케어 플랜 수립", description: "아동과 가족 중심의 케어 플랜을 수립합니다" },
      { step: 4, title: "전담 케어 시작", description: "전문 소아 간호 서비스를 시작합니다" },
    ],
    relatedServices: ["private-duty-nursing", "home-health", "skilled-nursing"],
  },
  {
    slug: "aba-therapy",
    nameEn: "Autism & ABA Therapy",
    nameKo: "자폐 스펙트럼 & ABA 치료",
    description:
      "과학적 근거에 기반한 ABA 치료로 자폐 스펙트럼 아동의 의사소통, 사회적 기술, 자조 능력 향상을 지원합니다. BCBA 지도 하의 전문 치료팀이 가정과 지역사회에서 개별화된 서비스를 제공합니다.",
    icon: "🧩",
    image: "/images/services/aba-therapy.jpg",
    href: "/what-we-do/aba-therapy",
    highlights: [
      "BCBA 지도 전문 ABA 치료",
      "개별화 치료 계획(BIP) 수립",
      "가정 기반 자연스러운 치료",
      "가족 교육 및 코칭 포함",
    ],
    targetAudience: ["자폐 스펙트럼 아동", "발달 장애 아동", "가족·보호자"],
    process: [
      { step: 1, title: "상담 신청", description: "전화 또는 온라인으로 상담을 신청합니다" },
      { step: 2, title: "초기 평가", description: "BCBA가 아동의 현재 기능 수준을 평가합니다" },
      { step: 3, title: "치료 계획 수립", description: "개별화된 행동 중재 계획을 수립합니다" },
      { step: 4, title: "치료 시작", description: "RBT가 일대일 치료 세션을 진행합니다" },
    ],
    relatedServices: ["ltci-beneficiary-care", "private-assistive-care", "skilled-nursing"],
  },
  {
    slug: "companion-care",
    nameEn: "Companion Care",
    nameKo: "동행 돌봄",
    description:
      "편안함과 연결, 그리고 안심을 전하는 신뢰할 수 있는 동행 돌봄 서비스입니다. 정서적 동행, 일상생활 지원, 이동 보조, 가사 지원 등 어르신의 삶의 질을 높이는 포괄적인 돌봄을 제공합니다.",
    icon: "🤗",
    image: "/images/services/companion-care.jpg",
    href: "/what-we-do/companion-care",
    highlights: [
      "정서적 동행 및 말벗",
      "일상생활·가사 지원",
      "이동 보조 서비스",
      "치매 케어 특화 서비스",
    ],
    targetAudience: ["어르신", "독거 노인", "치매 환자 가족"],
    process: [
      { step: 1, title: "상담 신청", description: "필요한 돌봄 서비스를 상담합니다" },
      { step: 2, title: "케어 제공자 매칭", description: "어르신과 잘 맞는 케어 제공자를 매칭합니다" },
      { step: 3, title: "서비스 시작", description: "일정에 따라 동행 돌봄 서비스를 시작합니다" },
      { step: 4, title: "정기 모니터링", description: "서비스 품질을 지속적으로 관리합니다" },
    ],
    relatedServices: ["long-term-care", "private-assistive-care", "hospice"],
  },
  {
    slug: "private-duty-nursing",
    nameEn: "Private Duty Nursing",
    nameKo: "전담 방문간호",
    description:
      "복잡한 의료적 필요를 가진 분들을 위한 전담 일대일 방문간호 서비스입니다. 기관절개관·인공호흡기 관리, 발작 관리, 경관영양, 재택 주사 치료 등 고도의 전문 간호를 가정에서 제공합니다.",
    icon: "💉",
    image: "/images/services/private-duty-nursing.jpg",
    href: "/what-we-do/private-duty-nursing",
    highlights: [
      "일대일 전담 전문 간호",
      "복잡 의료 기기 관리",
      "24시간 상주 케어 가능",
      "BAYADAbility 재활 연계",
    ],
    targetAudience: ["중증 만성질환자", "의료 기기 의존 환자", "복잡한 의료 필요 아동"],
    process: [
      { step: 1, title: "의뢰 접수", description: "의사 또는 가족이 서비스를 의뢰합니다" },
      { step: 2, title: "케어 평가", description: "전문 간호사가 의료적 필요를 평가합니다" },
      { step: 3, title: "간호사 배정", description: "전문 역량을 갖춘 간호사를 배정합니다" },
      { step: 4, title: "전담 케어 시작", description: "지속적인 전담 간호 서비스를 시작합니다" },
    ],
    relatedServices: ["skilled-nursing", "private-assistive-care", "hospice"],
  },
  {
    slug: "veterans",
    nameEn: "Veterans Care",
    nameKo: "국가유공자 지원",
    description:
      "국가를 위해 헌신하신 참전용사와 국가유공자분들을 위한 통합 돌봄 서비스입니다. PTSD 전문 교육팀, 지역사회 연계, 동료 지원 네트워크 등 참전용사의 특수한 필요에 맞춤 대응합니다.",
    icon: "🎖️",
    image: "/images/services/veterans.jpg",
    href: "/what-we-do/veterans",
    highlights: [
      "PTSD 전문 교육 케어팀",
      "보훈 지원 자원 연계",
      "예우와 기념 중심 돌봄",
      "동료 지원 네트워크 연결",
    ],
    targetAudience: ["참전용사", "국가유공자", "보훈 가족"],
    process: [
      { step: 1, title: "상담 신청", description: "전화 또는 온라인으로 상담을 신청합니다" },
      { step: 2, title: "필요 평가", description: "신체적·심리적 필요를 종합 평가합니다" },
      { step: 3, title: "케어 계획 수립", description: "참전용사 맞춤 케어 계획을 수립합니다" },
      { step: 4, title: "통합 지원 시작", description: "의료·사회·심리 통합 지원을 시작합니다" },
    ],
    relatedServices: ["skilled-nursing", "companion-care", "hospice"],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}

export function getRelatedServices(slug: string, limit = 3): ServiceData[] {
  const service = getServiceBySlug(slug);
  if (!service) return [];
  return service.relatedServices
    .map((s) => getServiceBySlug(s))
    .filter((s): s is ServiceData => !!s)
    .slice(0, limit);
}
