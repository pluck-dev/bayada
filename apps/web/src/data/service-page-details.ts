/**
 * 서비스 상세 페이지 확장 데이터
 * bayada.com 서비스 페이지 디자인 템플릿에 맞춘 한국어 콘텐츠
 */

export interface ServiceLearnMoreItem {
  title: string;
  content: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServicePageDetail {
  slug: string;
  heroImage: string;
  headline: string;
  longDescription: string;
  learnMoreItems: ServiceLearnMoreItem[];
  faqs: ServiceFAQ[];
  leadMagnet?: {
    title: string;
    description: string;
  };
  careTeamTitle: string;
  careTeamDescription: string;
  careTeamFeatures: string[];
  joinTeamTitle: string;
  joinTeamDescription: string;
}

export const servicePageDetails: Record<string, ServicePageDetail> = {
  "skilled-nursing": {
    slug: "skilled-nursing",
    heroImage: "/images/services/detail/home-health.webp",
    headline: "의사 처방 기반 전문 방문 간호로\n빠른 회복과 재입원을 예방합니다",
    longDescription:
      "수술, 질병, 입원 후 회복에 가장 좋은 장소는 바로 자신의 집입니다. BAYADA의 전문 간호사와 물리·작업·언어 치료사 팀이 가정을 방문하여 기능 회복과 건강 개선을 돕습니다. COPD, 당뇨 등 만성질환의 효과적인 자가 관리법도 함께 교육하여, 안전하게 집에서 생활하며 재입원을 예방할 수 있도록 지원합니다.",
    learnMoreItems: [
      { title: "전문 간호 케어", content: "상처 관리, 투약 관리, 정맥주사(IV) 관리, 카테터 관리 등 의사 처방에 따른 전문적인 간호 서비스를 제공합니다." },
      { title: "물리치료 (PT)", content: "관절 운동, 근력 강화, 보행 훈련 등을 통해 수술 후 또는 부상 후 신체 기능 회복을 지원합니다." },
      { title: "작업치료 (OT)", content: "일상생활 동작 훈련, 보조기기 사용법 교육 등으로 독립적인 생활 능력을 회복하도록 돕습니다." },
      { title: "언어치료", content: "삼킴 장애, 발음 장애, 인지-언어 장애 등에 대한 전문적인 치료를 제공합니다." },
      { title: "의료사회복지", content: "환자와 가족의 정서적 지지, 지역사회 자원 연결, 퇴원 후 생활 적응을 지원합니다." },
      { title: "개인 케어", content: "목욕, 식사 준비, 가사 지원 등 일상생활에 필요한 돌봄 서비스를 함께 제공합니다." },
    ],
    faqs: [
      { question: "방문 간호 서비스를 받으려면 어떤 자격이 필요한가요?", answer: "의사의 처방이 있고, 가정에서 간호가 필요한 상태이며, 외출이 어려운 경우 서비스를 받으실 수 있습니다. 장기요양등급이 있으면 보험 적용도 가능합니다." },
      { question: "서비스 시작 절차는 어떻게 되나요?", answer: "전화 또는 온라인 상담 신청 후, 전문 간호사가 가정을 방문하여 건강 상태를 평가합니다. 평가 결과를 바탕으로 개인 맞춤 케어 플랜을 수립하고 서비스를 시작합니다." },
      { question: "비용은 어떻게 되나요?", answer: "장기요양보험, 국민건강보험, 실비보험 등 다양한 보험 적용이 가능합니다. 정확한 비용은 상담 시 안내해 드립니다." },
    ],
    leadMagnet: {
      title: "방문 간호 제공기관 선택 시\n반드시 확인해야 할 10가지 질문",
      description: "올바른 방문 간호 서비스 선택은 올바른 질문에서 시작됩니다. 이 체크리스트로 가족에게 맞는 서비스를 자신 있게 선택하세요.",
    },
    careTeamTitle: "소중한 분을 위한 최고의 케어팀",
    careTeamDescription: "마음에서 시작해, 전문성으로 완성하는 케어",
    careTeamFeatures: [
      "고도 시뮬레이션 실습과 실제 시나리오 기반 교육",
      "체계적인 간호 레지던시 프로그램과 멘토링",
      "가족 중심 교육으로 보호자의 안도감 향상",
      "응급 대응 및 안전 프로토콜",
    ],
    joinTeamTitle: "방문 간호의 미래를 함께 만들어갈 분을 찾습니다",
    joinTeamDescription: "당신의 전문성으로 누군가의 삶을 변화시키세요. BAYADA에서 보람 있는 커리어를 시작하세요.",
  },

  "private-assistive-care": {
    slug: "private-assistive-care",
    heroImage: "/images/services/detail/companion-care.webp",
    headline: "일상의 모든 순간에\n따뜻한 돌봄을 함께합니다",
    longDescription:
      "맞춤형 방문 요양은 단순한 돌봄을 넘어, 어르신의 존엄성과 독립성을 지켜드리는 서비스입니다. 전문 요양보호사가 개인 위생 관리, 식사 준비, 가사 지원, 외출 동행 등 일상생활 전반을 돕습니다. 어르신 한 분 한 분의 생활 패턴과 선호를 존중하며, 가정에서 편안하고 안전한 생활을 유지할 수 있도록 지원합니다.",
    learnMoreItems: [
      { title: "개인 위생 관리", content: "목욕 보조, 옷 갈아입기, 구강 관리 등 개인위생 관련 일상생활을 세심하게 도와드립니다." },
      { title: "식사 준비 및 영양 관리", content: "어르신의 건강 상태와 선호에 맞는 식사를 준비하고, 식사 보조와 영양 관리를 지원합니다." },
      { title: "가사 지원", content: "청소, 세탁, 정리정돈 등 깨끗하고 안전한 생활 환경을 유지할 수 있도록 돕습니다." },
      { title: "외출 동행", content: "병원 방문, 산책, 장보기 등 외출 시 안전하게 동행하여 이동을 지원합니다." },
      { title: "정서적 지지", content: "말벗, 취미활동 함께하기, 사회적 교류 지원으로 정서적 안정과 삶의 질을 높입니다." },
    ],
    faqs: [
      { question: "맞춤형 방문 요양과 일반 요양의 차이는 무엇인가요?", answer: "맞춤형 방문 요양은 어르신 개인의 생활 패턴, 선호, 건강 상태에 맞게 케어 플랜을 설계합니다. 요양보호사 매칭도 개인 특성을 고려하여 진행합니다." },
      { question: "서비스 시간은 어떻게 되나요?", answer: "최소 3시간부터 24시간 상주 케어까지, 필요에 맞게 유연하게 조정 가능합니다. 주 1회부터 매일까지 방문 횟수도 선택하실 수 있습니다." },
      { question: "요양보호사는 어떻게 선발하나요?", answer: "엄격한 자격 심사와 신원 조회를 거치며, BAYADA 자체 교육 프로그램을 이수한 검증된 전문 인력만 배치합니다." },
    ],
    careTeamTitle: "신뢰할 수 있는 최고의 케어팀",
    careTeamDescription: "따뜻한 마음과 전문성을 갖춘 케어 전문가",
    careTeamFeatures: [
      "RN의 체계적인 케어 플랜 관리 및 팀 슈퍼비전",
      "종합적인 요양보호사 교육 및 역량 개발",
      "전담 오피스 지원 및 24시간 임상 상담 가능",
      "신뢰할 수 있는 보험 가입 요양보호사 맞춤 매칭",
    ],
    joinTeamTitle: "돌봄의 가치를 함께 실현할 분을 찾습니다",
    joinTeamDescription: "매일 누군가의 삶에 의미 있는 변화를 만들고 싶으신가요? BAYADA에서 보람 있는 커리어를 시작하세요.",
  },

  hospice: {
    slug: "hospice",
    heroImage: "/images/services/detail/hospice.webp",
    headline: "삶을 존중하고 가족을 지지하는\n맞춤형 호스피스 케어",
    longDescription:
      "호스피스 케어는 진단을 관리하는 것 이상으로, 모든 순간을 의미 있고 편안하며 평화롭게 만드는 것입니다. BAYADA 호스피스 팀은 환자와 가족의 이야기, 가치, 바람을 깊이 이해하여, 가장 소중한 방식으로 시간을 보낼 수 있도록 돕습니다. 통증 및 증상 관리를 중심으로, 개인 케어, 사회복지, 심리 상담, 보완 치료 등 맞춤형 케어를 제공합니다.",
    learnMoreItems: [
      { title: "통증 및 증상 관리", content: "전문 의료진이 환자의 통증과 불편한 증상을 적극적으로 관리하여 편안함을 유지합니다." },
      { title: "개인 케어 및 가사 지원", content: "일상생활 돌봄과 가사 지원으로 환자와 가족의 부담을 덜어드립니다." },
      { title: "정서적·사회적 지원", content: "전문 상담사가 환자와 가족의 심리적 안정과 정서적 지지를 제공합니다." },
      { title: "영적 케어", content: "환자의 영적 필요와 가치를 존중하며, 마음의 평화를 위한 지지를 제공합니다." },
      { title: "사별 지원", content: "가족을 위한 사별 상담과 지지 프로그램을 통해 슬픔을 함께 나눕니다." },
      { title: "가족 교육", content: "환자 돌봄에 필요한 지식과 기술을 가족에게 교육하여 자신감을 높여드립니다." },
    ],
    faqs: [
      { question: "호스피스 케어는 언제 시작하는 것이 좋은가요?", answer: "호스피스는 가능한 일찍 시작하는 것이 좋습니다. 일찍 시작할수록 환자와 가족 모두 더 나은 삶의 질을 유지할 수 있으며, 함께하는 시간에 집중할 수 있습니다." },
      { question: "호스피스는 포기를 의미하나요?", answer: "아닙니다. 호스피스는 삶을 포기하는 것이 아니라, 남은 시간을 가장 의미 있고 편안하게 보내기 위한 적극적인 선택입니다. 통증 관리와 삶의 질 향상에 초점을 맞춥니다." },
      { question: "호스피스 서비스 비용은 어떻게 되나요?", answer: "건강보험 적용이 가능하며, 본인부담금이 경감되는 경우도 있습니다. 구체적인 비용은 상담 시 안내해 드립니다." },
    ],
    leadMagnet: {
      title: "호스피스에 대해 알아야 할\n진실과 오해",
      description: "호스피스에 대한 가장 큰 오해 중 하나는 죽음에 관한 것이라는 것입니다. 사실 호스피스는 삶에 관한 것입니다. 오해를 이해로 바꿔보세요.",
    },
    careTeamTitle: "소중한 분을 위한 가장 신뢰받는 케어팀",
    careTeamDescription: "따뜻한 마음과 전문성으로 함께하는 케어",
    careTeamFeatures: [
      "RN의 체계적인 케어 플랜 관리 및 팀 슈퍼비전",
      "종합적인 케어 전문가 교육 및 역량 개발",
      "전담 오피스 지원 및 24시간 임상 상담 가능",
      "신뢰할 수 있는 보험 가입 전문 인력 맞춤 매칭",
    ],
    joinTeamTitle: "호스피스 케어의 혁신을 함께할 분을 찾습니다",
    joinTeamDescription: "매일 의미 있는 변화를 만들고 싶으신가요? BAYADA에서 가족들이 신뢰하는 팀의 일원이 되세요.",
  },

  "ltci-beneficiary-care": {
    slug: "ltci-beneficiary-care",
    heroImage: "/images/services/detail/habilitation.webp",
    headline: "노인장기요양보험 수급자를 위한\n체계적인 종합 케어",
    longDescription:
      "노인장기요양보험 수급자를 위한 종합 케어 서비스입니다. 방문간호, 방문요양, 방문목욕 등 법정 급여 서비스를 BAYADA만의 품질 관리 시스템으로 제공합니다. 등급별 맞춤 케어 플랜으로 어르신의 잔존 기능을 유지하고, 가족의 돌봄 부담을 경감합니다.",
    learnMoreItems: [
      { title: "방문간호", content: "전문 간호사가 가정을 방문하여 건강 상태 확인, 투약 관리, 상처 관리 등의 간호 서비스를 제공합니다." },
      { title: "방문요양", content: "요양보호사가 신체활동 지원, 가사활동 지원, 인지활동 프로그램 등 일상생활 전반을 돕습니다." },
      { title: "방문목욕", content: "이동목욕차량을 이용하여 가정에서 목욕 서비스를 제공합니다. 거동이 어려운 어르신도 편안하게 이용 가능합니다." },
      { title: "요양시설 서비스", content: "24시간 전문 케어가 필요한 경우, 질 높은 요양시설 서비스를 연계해 드립니다." },
    ],
    faqs: [
      { question: "장기요양등급은 어떻게 받나요?", answer: "국민건강보험공단에 장기요양인정 신청을 하면, 방문 조사와 등급판정위원회 심의를 거쳐 등급이 결정됩니다. BAYADA에서 신청 절차도 안내해 드립니다." },
      { question: "본인부담금은 얼마인가요?", answer: "장기요양보험 적용 시 일반적으로 재가급여는 15%, 시설급여는 20%의 본인부담금이 발생합니다. 기초생활수급자 등은 감면 혜택이 있습니다." },
      { question: "어떤 등급부터 서비스를 받을 수 있나요?", answer: "1~5등급 및 인지지원등급(6등급)까지 장기요양등급 판정을 받으신 분은 모두 서비스를 이용하실 수 있습니다." },
    ],
    careTeamTitle: "전문성과 따뜻함을 갖춘 케어팀",
    careTeamDescription: "국가 자격과 BAYADA 교육을 겸비한 전문가",
    careTeamFeatures: [
      "국가 자격 보유 전문 간호사 및 요양보호사",
      "BAYADA 자체 교육 프로그램 이수",
      "정기적 슈퍼비전 및 역량 평가",
      "24시간 긴급 연락 체계 운영",
    ],
    joinTeamTitle: "장기요양 서비스의 품질을 높일 분을 찾습니다",
    joinTeamDescription: "체계적인 교육과 지원 시스템에서 전문가로 성장하세요. BAYADA와 함께 의미 있는 커리어를 만들어가세요.",
  },

  "physical-trainer": {
    slug: "physical-trainer",
    heroImage: "/images/services/detail/private-duty-nursing.webp",
    headline: "전문 트레이너가 찾아가는\n맞춤형 운동 프로그램",
    longDescription:
      "전문 트레이너가 가정을 방문하여 개인의 건강 상태와 목표에 맞는 운동 프로그램을 제공합니다. 재활 운동, 낙상 예방, 근력 강화, 유연성 향상 등 과학적 근거에 기반한 운동을 지도하여, 어르신의 신체 기능 유지와 삶의 질 향상을 돕습니다.",
    learnMoreItems: [
      { title: "재활 운동", content: "수술 후, 부상 후 또는 만성질환 관련 재활 운동을 전문적으로 지도합니다." },
      { title: "낙상 예방 운동", content: "균형감각 훈련, 하지 근력 강화 등 낙상 위험을 줄이는 맞춤 운동 프로그램입니다." },
      { title: "근력 강화", content: "연령과 체력 수준에 맞는 근력 강화 운동으로 일상생활 수행 능력을 향상시킵니다." },
      { title: "유연성 및 관절 운동", content: "관절 가동 범위를 유지하고 유연성을 향상시키는 스트레칭 및 운동을 지도합니다." },
    ],
    faqs: [
      { question: "어떤 분이 이용하실 수 있나요?", answer: "시니어, 재활이 필요한 환자, 만성질환 관리가 필요한 분 등 누구나 이용 가능합니다. 건강 상태에 따라 맞춤 프로그램을 설계합니다." },
      { question: "운동 시 안전은 어떻게 보장하나요?", answer: "모든 트레이너는 전문 자격을 보유하고 있으며, 운동 전 건강 상태를 확인하고 안전한 범위 내에서 운동을 진행합니다." },
      { question: "주 몇 회 방문하나요?", answer: "개인의 목표와 건강 상태에 따라 주 1~3회 방문을 기본으로 하며, 유연하게 조정 가능합니다." },
    ],
    careTeamTitle: "과학적 훈련으로 건강을 지키는 전문가",
    careTeamDescription: "체계적 교육과 실전 경험을 갖춘 트레이너",
    careTeamFeatures: [
      "전문 체육 및 재활 자격 보유",
      "시니어 특화 운동 처방 교육 이수",
      "안전 프로토콜 및 응급 대응 훈련",
      "정기적 운동 효과 평가 및 프로그램 조정",
    ],
    joinTeamTitle: "건강한 노후를 함께 만들어갈 분을 찾습니다",
    joinTeamDescription: "전문성을 살려 어르신들의 건강한 삶에 기여하세요. BAYADA에서 성장하는 커리어를 만나보세요.",
  },

  "transitional-care": {
    slug: "transitional-care",
    heroImage: "/images/services/detail/home-health.webp",
    headline: "병원에서 가정으로,\n끊김 없는 연속 케어",
    longDescription:
      "퇴원 후 가정에서의 안전한 회복을 위한 전환의료 프로그램입니다. 병원과 긴밀히 협력하여 퇴원 계획을 수립하고, 가정에서 필요한 의료 및 생활 지원 서비스를 연속적으로 제공합니다. 재입원을 예방하고, 가정에서 독립적인 생활로 복귀하도록 돕는 것이 목표입니다.",
    learnMoreItems: [
      { title: "퇴원 계획 수립", content: "병원 의료진과 협력하여 퇴원 전 가정 복귀를 위한 체계적인 계획을 수립합니다." },
      { title: "가정 환경 평가", content: "안전한 회복을 위해 가정 환경을 사전에 평가하고 필요한 조치를 제안합니다." },
      { title: "집중 간호 서비스", content: "퇴원 직후 집중적인 방문 간호와 건강 모니터링을 제공합니다." },
      { title: "재입원 예방 관리", content: "정기적 건강 체크, 투약 관리, 증상 모니터링으로 재입원 위험을 최소화합니다." },
    ],
    faqs: [
      { question: "전환의료 프로그램은 얼마나 진행되나요?", answer: "일반적으로 퇴원 후 30~90일 동안 집중 관리를 제공합니다. 환자의 상태에 따라 기간은 조정될 수 있습니다." },
      { question: "어떤 병원과 연계되나요?", answer: "서울 및 수도권 주요 종합병원과 연계하여 서비스를 제공합니다. 구체적인 연계 병원은 상담 시 안내해 드립니다." },
      { question: "보험 적용이 가능한가요?", answer: "건강보험 및 장기요양보험 적용이 가능한 부분이 있으며, 상세 사항은 상담 시 안내해 드립니다." },
    ],
    careTeamTitle: "병원과 가정을 잇는 전문 케어팀",
    careTeamDescription: "의료기관 연계 경험이 풍부한 전문가",
    careTeamFeatures: [
      "종합병원 연계 전환의료 전문 교육 이수",
      "재입원 예방 프로토콜 수립 및 운영",
      "다직종 팀 협력 체계 운영",
      "환자·가족 교육 및 자가관리 역량 강화",
    ],
    joinTeamTitle: "전환의료의 새로운 기준을 만들어갈 분을 찾습니다",
    joinTeamDescription: "병원과 가정의 연결고리가 되어보세요. BAYADA에서 의미 있는 변화를 만들어가세요.",
  },

  "patient-support": {
    slug: "patient-support",
    heroImage: "/images/services/detail/pediatric.webp",
    headline: "제약사와 함께하는\n환자 중심 통합 지원 프로그램",
    longDescription:
      "제약사와 연계하여 환자의 치료 여정을 종합적으로 지원합니다. 약제비 지원 안내, 환자 교육, 복약 관리, 건강 모니터링 등 치료 효과를 극대화하기 위한 통합적 지원을 제공합니다. 환자가 처방된 치료를 지속적으로 받을 수 있도록 돕는 것이 핵심입니다.",
    learnMoreItems: [
      { title: "약제비 지원 안내", content: "환자가 이용 가능한 약제비 지원 프로그램과 보험 혜택을 안내하고 신청을 돕습니다." },
      { title: "환자 교육", content: "질환과 약물에 대한 이해를 높이는 교육을 제공하여 치료 순응도를 향상시킵니다." },
      { title: "복약 관리", content: "정기적인 복약 확인과 부작용 모니터링으로 안전한 약물 치료를 지원합니다." },
      { title: "건강 모니터링", content: "정기적 건강 체크와 데이터 관리로 치료 효과를 추적하고 의료진에게 보고합니다." },
    ],
    faqs: [
      { question: "어떤 질환의 환자가 이용할 수 있나요?", answer: "만성질환, 희귀질환, 암 등 다양한 질환의 환자가 이용 가능합니다. 연계된 제약사의 프로그램에 따라 대상이 달라질 수 있습니다." },
      { question: "비용이 발생하나요?", answer: "환자지원프로그램은 대부분 무료로 제공됩니다. 제약사의 지원으로 운영되기 때문입니다." },
      { question: "의사 처방이 필요한가요?", answer: "네, 담당 의사의 처방과 동의가 있어야 프로그램에 참여할 수 있습니다." },
    ],
    careTeamTitle: "환자의 치료 여정을 함께하는 전문가",
    careTeamDescription: "제약 및 임상 전문성을 갖춘 케어팀",
    careTeamFeatures: [
      "제약사 연계 전문 교육 프로그램 이수",
      "질환별 전문 지식 및 복약 관리 역량",
      "환자 교육 및 상담 스킬",
      "데이터 기반 치료 효과 모니터링",
    ],
    joinTeamTitle: "환자 지원의 전문가가 되어보세요",
    joinTeamDescription: "환자의 치료 여정에 함께하며 삶의 질을 높이는 보람 있는 일을 경험하세요.",
  },

  dct: {
    slug: "dct",
    heroImage: "/images/services/detail/private-duty-nursing.webp",
    headline: "가정 기반 분산형 임상시험으로\n참여자 편의와 데이터 품질을 높입니다",
    longDescription:
      "분산형 임상시험(DCT)은 환자가 병원 대신 가정에서 임상시험에 참여할 수 있도록 하는 혁신적인 모델입니다. BAYADA의 전문 간호 인력이 가정을 방문하여 프로토콜에 따른 검사, 약물 투여, 데이터 수집을 수행합니다. 참여자의 부담을 줄이면서도 높은 데이터 품질을 보장합니다.",
    learnMoreItems: [
      { title: "프로토콜 기반 방문 서비스", content: "임상시험 프로토콜에 따라 전문 간호사가 가정을 방문하여 필요한 의료 행위를 수행합니다." },
      { title: "데이터 수집 및 관리", content: "정확한 데이터 수집과 전자적 관리 시스템을 통해 임상 데이터의 품질과 무결성을 보장합니다." },
      { title: "참여자 관리", content: "임상시험 참여자의 안전을 최우선으로, 부작용 모니터링과 지속적 관리를 제공합니다." },
      { title: "글로벌 임상 경험", content: "글로벌 BAYADA 네트워크의 임상시험 경험과 노하우를 한국에 적용합니다." },
    ],
    faqs: [
      { question: "어떤 종류의 임상시험에 적용 가능한가요?", answer: "Phase I부터 IV까지 다양한 단계의 임상시험에 적용 가능합니다. 프로토콜 특성에 따라 가정 방문 서비스의 범위를 설계합니다." },
      { question: "데이터 품질은 어떻게 보장하나요?", answer: "GCP(임상시험관리기준)을 준수하며, 표준화된 프로세스와 전자 데이터 관리 시스템을 통해 품질을 관리합니다." },
    ],
    careTeamTitle: "임상 전문성을 갖춘 방문 간호팀",
    careTeamDescription: "GCP 교육을 이수한 임상 전문 간호사",
    careTeamFeatures: [
      "GCP 및 ICH 가이드라인 교육 이수",
      "임상시험 전문 간호 역량",
      "정확한 데이터 수집 및 보고 체계",
      "글로벌 임상시험 프로토콜 경험",
    ],
    joinTeamTitle: "임상시험의 새로운 방식에 함께하세요",
    joinTeamDescription: "분산형 임상시험의 전문가로 성장하세요. BAYADA에서 글로벌 임상 경험을 쌓을 수 있습니다.",
  },

  "long-term-care": {
    slug: "long-term-care",
    heroImage: "/images/services/detail/companion-care.webp",
    headline: "전문적이고 체계적인\n장기 돌봄으로 삶의 질을 지킵니다",
    longDescription:
      "장기요양이 필요한 분들을 위한 통합 서비스입니다. 전문 인력의 체계적인 돌봄으로 어르신의 잔존 기능을 최대한 유지하고, 존엄한 삶을 영위하실 수 있도록 지원합니다. 가족의 돌봄 부담을 경감하면서도 품질 높은 서비스를 제공합니다.",
    learnMoreItems: [
      { title: "통합 케어 플랜", content: "간호, 요양, 재활, 영양 등 다직종 전문가가 참여하여 종합적인 케어 플랜을 수립합니다." },
      { title: "전문 인력 배치", content: "어르신의 상태와 필요에 맞는 최적의 전문 인력을 배치합니다." },
      { title: "품질 관리 시스템", content: "BAYADA 글로벌 품질 관리 기준에 따라 서비스 품질을 지속적으로 모니터링합니다." },
      { title: "가족 지원 프로그램", content: "보호자 교육, 정서적 지지, 돌봄 휴식 서비스 등 가족을 위한 지원 프로그램을 운영합니다." },
    ],
    faqs: [
      { question: "장기요양서비스는 어떤 분이 이용하시나요?", answer: "장기요양등급 판정을 받으신 분, 만성질환으로 지속적 돌봄이 필요하신 분, 고령으로 일상생활에 어려움이 있으신 분이 주로 이용하십니다." },
      { question: "가족도 지원을 받을 수 있나요?", answer: "네, BAYADA는 돌봄을 받는 분뿐만 아니라 돌보는 가족도 함께 지원합니다. 보호자 교육, 상담, 돌봄 휴식 서비스 등을 제공합니다." },
    ],
    careTeamTitle: "장기 돌봄의 전문가 팀",
    careTeamDescription: "지속적 교육과 체계적 관리를 받는 전문 인력",
    careTeamFeatures: [
      "장기요양 전문 교육 프로그램 이수",
      "정기적 역량 평가 및 보수 교육",
      "슈퍼비전 시스템을 통한 품질 관리",
      "치매 케어 특화 교육",
    ],
    joinTeamTitle: "장기요양 서비스의 전문가로 성장하세요",
    joinTeamDescription: "체계적인 교육과 지원 속에서 전문가로 성장할 수 있습니다. BAYADA와 함께하세요.",
  },

  "senior-living": {
    slug: "senior-living",
    heroImage: "/images/services/detail/habilitation.webp",
    headline: "안전하고 편안한 시니어 생활을 위한\n맞춤형 솔루션",
    longDescription:
      "시니어의 독립적이고 안전한 생활을 위한 종합 솔루션입니다. 생활 환경 평가와 개선, 안전 설비 설치, 스마트 홈 기기 연동 등을 통해 가정에서 오래도록 편안하게 생활하실 수 있도록 지원합니다. BAYADA의 교육 프로그램과 연계하여 건강한 노후를 설계합니다.",
    learnMoreItems: [
      { title: "생활 환경 평가", content: "전문가가 가정을 방문하여 안전 위험 요소를 평가하고 개선 방안을 제안합니다." },
      { title: "안전 설비 설치", content: "낙상 방지 손잡이, 미끄럼 방지, 적절한 조명 등 안전 설비를 설치합니다." },
      { title: "스마트 홈 연동", content: "응급 호출, 활동 감지, 약 복용 알림 등 스마트 기기를 활용한 안전 관리 시스템을 구축합니다." },
      { title: "교육 프로그램 연결", content: "건강 관리, 영양, 운동 등 시니어를 위한 다양한 교육 프로그램을 연결해 드립니다." },
    ],
    faqs: [
      { question: "비용은 어떻게 되나요?", answer: "환경 평가는 무료로 제공되며, 안전 설비 설치 비용은 범위에 따라 달라집니다. 상담 시 맞춤 견적을 안내해 드립니다." },
      { question: "아파트에서도 이용 가능한가요?", answer: "네, 아파트, 단독주택, 빌라 등 모든 유형의 주거 공간에서 이용 가능합니다." },
    ],
    careTeamTitle: "시니어 라이프를 설계하는 전문가",
    careTeamDescription: "생활 환경과 건강을 함께 고려하는 전문가",
    careTeamFeatures: [
      "시니어 주거 환경 전문 평가 역량",
      "스마트 홈 기기 설치 및 교육",
      "낙상 예방 환경 설계 전문성",
      "건강 프로그램 연계 및 상담",
    ],
    joinTeamTitle: "시니어의 안전한 생활을 함께 만들어가세요",
    joinTeamDescription: "시니어 라이프 솔루션 전문가로 성장하세요. BAYADA에서 새로운 가능성을 발견하세요.",
  },

  "mobile-clinical": {
    slug: "mobile-clinical",
    heroImage: "/images/services/detail/aba-therapy.webp",
    headline: "이동형 임상 서비스의\n설계부터 운영까지",
    longDescription:
      "의료기관과 기업을 대상으로 이동형 임상 서비스에 대한 전문 컨설팅을 제공합니다. BAYADA의 글로벌 경험과 노하우를 바탕으로, 고객 맞춤형 모바일 클리니컬 서비스의 설계, 인력 교육, 운영 체계 구축을 지원합니다.",
    learnMoreItems: [
      { title: "서비스 설계 컨설팅", content: "고객의 요구사항과 목표에 맞는 이동형 임상 서비스 모델을 설계합니다." },
      { title: "인력 교육 및 배치", content: "서비스 운영에 필요한 전문 인력의 교육과 적절한 배치를 지원합니다." },
      { title: "운영 체계 구축", content: "품질 관리, 데이터 관리, 안전 관리 등 서비스 운영에 필요한 시스템을 구축합니다." },
      { title: "파일럿 및 본 운영 지원", content: "시범 운영을 통한 검증 후 본격적인 서비스 운영을 지원합니다." },
    ],
    faqs: [
      { question: "어떤 기관이 컨설팅을 받을 수 있나요?", answer: "의료기관, 제약사, 헬스케어 기업, 보험사 등 이동형 임상 서비스 도입을 원하는 모든 기관이 대상입니다." },
      { question: "컨설팅 기간은 얼마나 되나요?", answer: "프로젝트 범위에 따라 3~12개월 정도 소요됩니다. 상세한 일정은 초기 상담 시 안내해 드립니다." },
    ],
    careTeamTitle: "글로벌 임상 경험의 전문 컨설턴트",
    careTeamDescription: "BAYADA 글로벌 네트워크의 전문성을 활용",
    careTeamFeatures: [
      "글로벌 모바일 클리니컬 운영 경험",
      "국내 규제 및 의료 환경 전문 지식",
      "체계적인 품질 관리 프레임워크",
      "인력 교육 및 역량 개발 프로그램",
    ],
    joinTeamTitle: "헬스케어 컨설팅의 전문가가 되어보세요",
    joinTeamDescription: "글로벌 경험과 국내 전문성을 결합하여 헬스케어 혁신을 이끌어보세요.",
  },

  education: {
    slug: "education",
    heroImage: "/images/services/detail/aba-therapy.webp",
    headline: "50년 BAYADA 노하우를 기반으로 한\n전문 헬스케어 교육",
    longDescription:
      "BAYADA의 50년 홈헬스케어 경험과 노하우를 기반으로 한 전문 교육 서비스입니다. 케어 제공자를 위한 전문 교육, 이용자·보호자를 위한 실용 교육, 인증 교육 프로그램을 운영합니다. 이론과 실무를 결합한 체계적 커리큘럼으로 케어의 질을 높입니다.",
    learnMoreItems: [
      { title: "제공자 전문 교육", content: "간호사, 요양보호사, 트레이너 등 케어 제공자를 위한 전문 역량 강화 교육입니다." },
      { title: "이용자·보호자 교육", content: "자가관리, 돌봄 기술, 건강 관리 등 이용자와 보호자를 위한 실용적 교육입니다." },
      { title: "인증 교육 프로그램", content: "수료 후 인증서를 발급받을 수 있는 체계적인 교육 프로그램입니다." },
      { title: "온라인·오프라인 교육", content: "DeiEdu 플랫폼을 통한 온라인 교육과 현장 실습 교육을 제공합니다." },
    ],
    faqs: [
      { question: "교육비는 얼마인가요?", answer: "교육 과정에 따라 무료부터 유료까지 다양합니다. 일부 과정은 BAYADA 서비스 이용 시 무료로 제공됩니다." },
      { question: "온라인으로도 수강할 수 있나요?", answer: "네, DeiEdu 플랫폼을 통해 온라인으로 수강 가능한 과정이 다수 있습니다. 실습이 필요한 과정은 오프라인으로 진행됩니다." },
    ],
    careTeamTitle: "글로벌 교육 전문가",
    careTeamDescription: "50년 BAYADA 교육 노하우를 전수하는 전문 강사진",
    careTeamFeatures: [
      "현장 경험이 풍부한 전문 강사진",
      "이론과 실무를 결합한 체계적 커리큘럼",
      "시뮬레이션 기반 실습 교육",
      "글로벌 교육 품질 기준 적용",
    ],
    joinTeamTitle: "교육을 통해 케어의 미래를 만들어가세요",
    joinTeamDescription: "BAYADA의 교육 전문가로 케어 산업의 발전에 기여하세요.",
  },
};

export function getServicePageDetail(slug: string): ServicePageDetail | undefined {
  return servicePageDetails[slug];
}
