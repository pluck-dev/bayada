import type { AudienceSegment } from "@/types";

// 서비스 제공자 세그먼트 (FR-W-003)
export const providerSegments: AudienceSegment[] = [
  {
    slug: "healthcare-professionals",
    type: "provider",
    nameEn: "Healthcare Professionals",
    nameKo: "의료인",
    description: "간호사, 물리치료사, 작업치료사 등 의료 전문인을 위한 BAYADA 네트워크입니다.",
    icon: "👩‍⚕️",
    image: "/images/audiences/healthcare-professionals.jpg",
    href: "/who-we-serve/providers/healthcare-professionals",
    highlights: [
      "전문 역량 개발 교육",
      "유연한 근무 일정",
      "경쟁력 있는 보상",
      "글로벌 네트워크 참여",
    ],
    ctaLabel: "지원하기",
    ctaHref: "/who-we-serve/providers/healthcare-professionals",

    contentHeadline: "전문 의료인을 위한\nBAYADA 네트워크에 합류하세요",
    contentDescription:
      "BAYADA는 간호사, 물리치료사, 작업치료사, 언어치료사 등 다양한 의료 전문인이 최고의 역량을 발휘할 수 있는 환경을 제공합니다. 미국에서 50년 이상 쌓아온 홈헬스케어 노하우를 바탕으로, 국내 의료 환경에 최적화된 교육 체계와 지원 시스템을 운영합니다. 안정적인 근무 환경과 성장 기회를 동시에 원하는 의료인이라면 BAYADA와 함께하세요.",
    features: [
      {
        icon: "💰",
        title: "경쟁력 있는 급여·복리후생",
        description: "시장 최상위 수준의 급여 체계, 4대 보험 완비, 건강검진 지원, 자녀 학자금 등 폭넓은 복리후생을 제공합니다.",
      },
      {
        icon: "🗓️",
        title: "유연한 스케줄 관리",
        description: "전일제, 시간제, 파트타임 등 다양한 근무 형태를 선택할 수 있어 워크-라이프 밸런스를 유지할 수 있습니다.",
      },
      {
        icon: "📚",
        title: "체계적인 전문성 개발",
        description: "연간 100시간 이상의 사내 교육, 외부 학회 지원, 자격증 취득 지원 등 지속적인 전문성 향상 프로그램을 운영합니다.",
      },
      {
        icon: "🌐",
        title: "글로벌 네트워크 참여",
        description: "미국·캐나다·유럽 등 BAYADA 글로벌 네트워크와 연결되어 해외 임상 경험 및 교류 프로그램에 참여할 수 있습니다.",
      },
      {
        icon: "🤝",
        title: "전담 팀 서포트",
        description: "현장 배치 후에도 임상 슈퍼바이저와 케어 코디네이터가 지속적으로 지원하며, 어려운 케이스는 함께 해결합니다.",
      },
      {
        icon: "📈",
        title: "커리어 성장 경로",
        description: "임상 전문인 → 수퍼바이저 → 팀장 → 지역 관리자로 이어지는 명확한 커리어 패스와 내부 승진 우선 원칙을 적용합니다.",
      },
    ],

    processTitle: "합류 프로세스",
    processSteps: [
      {
        title: "온라인 지원",
        description: "채용 페이지에서 포지션을 선택하고 이력서와 자격증 사본을 첨부해 지원합니다.",
      },
      {
        title: "서류 검토 및 면접",
        description: "인사팀과 임상 슈퍼바이저가 서류를 검토하고, 화상·대면 면접으로 역량과 적합도를 확인합니다.",
      },
      {
        title: "오리엔테이션 및 교육",
        description: "합격 후 3일간의 집중 오리엔테이션과 현장 실습을 통해 BAYADA의 케어 철학과 시스템을 익힙니다.",
      },
      {
        title: "현장 배치 및 지속 지원",
        description: "담당 케어 코디네이터와 함께 첫 케이스를 시작하며, 정기 1:1 피드백 세션으로 성장을 지원합니다.",
      },
    ],

    stats: [
      { value: "1,200+", label: "소속 간호사·치료사 수" },
      { value: "97", label: "직원 만족도", suffix: "%" },
      { value: "120", label: "연간 평균 교육 시간", suffix: "시간" },
      { value: "89", label: "3년 이상 재직률", suffix: "%" },
    ],

    testimonials: [
      {
        quote: "BAYADA에 합류한 후 제 임상 역량이 눈에 띄게 성장했습니다. 현장 슈퍼바이저의 꼼꼼한 피드백과 다양한 교육 기회 덕분에 자신 있게 환자를 케어할 수 있어요.",
        author: "김지현",
        role: "방문간호사 (3년 차)",
      },
      {
        quote: "파트타임으로 시작했는데 유연한 스케줄 덕분에 육아와 병행하면서도 전문성을 계속 키울 수 있었습니다. 동료들과의 팀워크가 정말 든든합니다.",
        author: "박수진",
        role: "작업치료사 (2년 차)",
      },
    ],

    faqs: [
      {
        question: "지원 자격 요건은 무엇인가요?",
        answer: "간호사 면허증(RN/LPN), 물리치료사 또는 작업치료사 면허증 보유자라면 경력 무관하게 지원 가능합니다. 신입도 환영하며 별도 교육 프로그램을 운영합니다.",
      },
      {
        question: "근무 지역을 선택할 수 있나요?",
        answer: "거주지 인근 담당 구역을 우선 배정하며, 이동 가능 범위를 협의해 최대한 맞춤 배치합니다. 차량 지원 및 교통비도 지급합니다.",
      },
      {
        question: "채용 절차는 얼마나 걸리나요?",
        answer: "서류 접수 후 평균 2주 이내에 결과를 안내드립니다. 오리엔테이션을 포함하면 지원부터 현장 배치까지 약 4주가 소요됩니다.",
      },
      {
        question: "파트타임·프리랜서 형태로도 근무할 수 있나요?",
        answer: "네, 주 15시간 이상의 파트타임 계약부터 전일제까지 다양한 형태로 근무할 수 있습니다. 근무 형태 변경도 내부 절차를 통해 유연하게 조정 가능합니다.",
      },
    ],

    relatedServices: ["home-nursing", "rehabilitation", "palliative-care"],
  },

  {
    slug: "other-professionals",
    type: "provider",
    nameEn: "Other Professionals",
    nameKo: "비의료인",
    description: "요양보호사, 사회복지사 등 비의료 전문인을 위한 BAYADA 네트워크입니다.",
    icon: "🧑‍🤝‍🧑",
    image: "/images/audiences/other-professionals.jpg",
    href: "/who-we-serve/providers/other-professionals",
    highlights: [
      "체계적 교육 프로그램",
      "안정적 근무 환경",
      "경력 개발 지원",
      "복리후생 제공",
    ],
    ctaLabel: "지원하기",
    ctaHref: "/who-we-serve/providers/other-professionals",

    contentHeadline: "요양보호사·사회복지사를 위한\n성장의 기회",
    features: [
      {
        icon: "🎓",
        title: "체계적인 교육 프로그램",
        description: "입사 후 전문 트레이너가 진행하는 실무 중심 교육과 정기 보수교육으로 전문성을 지속적으로 높입니다.",
      },
      {
        icon: "🏡",
        title: "안정적인 근무 환경",
        description: "지속적인 케어 매칭과 전담 코디네이터의 지원으로 안정적인 업무 환경을 보장합니다.",
      },
      {
        icon: "🌱",
        title: "경력 개발 지원",
        description: "요양보호사 → 팀 리더 → 슈퍼바이저로의 내부 승진 경로와 사회복지사 2급→1급 자격 취득 지원을 제공합니다.",
      },
      {
        icon: "🎁",
        title: "풍부한 복리후생",
        description: "4대 보험, 명절 상여금, 근속 포상, 직원 건강검진 등 실질적인 복지 혜택을 누릴 수 있습니다.",
      },
    ],

    processSteps: [
      {
        title: "지원서 제출",
        description: "온라인 채용 페이지에서 포지션을 선택하고 간단한 지원서와 자격증 사본을 제출합니다.",
      },
      {
        title: "면접 및 매칭",
        description: "담당자와의 면담을 통해 적합한 근무 지역과 케어 대상을 협의하고 결정합니다.",
      },
      {
        title: "교육 이수 및 현장 투입",
        description: "오리엔테이션과 현장 실습 교육을 마친 후 담당 케이스에 배치되어 실무를 시작합니다.",
      },
    ],

    stats: [
      { value: "2,500+", label: "소속 요양보호사·복지사 수" },
      { value: "94", label: "근무 만족도", suffix: "%" },
      { value: "80", label: "연간 교육 시간", suffix: "시간+" },
    ],

    learnMoreItems: [
      {
        title: "자격 요건",
        content: "요양보호사 자격증 또는 사회복지사 2급 이상 자격증 보유자라면 경력 무관하게 지원할 수 있습니다. 자격증 취득 예정자도 상담 가능합니다.",
      },
      {
        title: "교육 과정",
        content: "입사 시 3일간의 집중 오리엔테이션, 분기별 심화 교육(치매 케어, 응급처치, 이동 지원 기술 등)을 제공합니다. 모든 교육은 근무 시간으로 인정됩니다.",
      },
      {
        title: "근무 환경",
        content: "담당 구역 내 케어 매칭으로 이동 거리를 최소화하며, 전담 코디네이터가 현장 문제 해결을 즉시 지원합니다. 주 5일 근무를 기본으로 시간제도 가능합니다.",
      },
      {
        title: "보상 체계",
        content: "업계 상위 수준의 시급 + 4대 보험 + 교통비 지원 + 장기 근속 인센티브를 제공합니다. 야간·주말 근무 수당도 별도 지급합니다.",
      },
      {
        title: "지원 방법",
        content: "홈페이지 채용 페이지에서 지원하거나 대표 번호(1670-1379)로 전화하시면 채용 담당자가 상세히 안내해 드립니다.",
      },
    ],

    careerTitle: "비의료 전문인을 위한 커리어를 시작하세요",
    careerDescription: "요양보호사·사회복지사로서의 전문성을 BAYADA와 함께 더욱 키워나가세요. 안정적인 일자리와 체계적인 성장 경로가 여러분을 기다립니다.",
  },

  {
    slug: "hospitals",
    type: "provider",
    nameEn: "Hospitals",
    nameKo: "병원",
    description: "전환의료 프로그램을 통한 병원 연계 서비스를 제공합니다.",
    icon: "🏥",
    image: "/images/audiences/hospitals.jpg",
    href: "/who-we-serve/providers/medical-institutes/hospitals",
    highlights: [
      "전환의료 프로그램 연계",
      "재입원율 감소",
      "환자 만족도 향상",
      "BAYADA 품질 관리 시스템",
    ],
    ctaLabel: "파트너십 문의",
    ctaHref: "/who-we-serve/providers/medical-institutes/hospitals",

    contentHeadline: "병원과 BAYADA의\n전환의료 파트너십",
    contentDescription:
      "퇴원 후 환자가 안전하게 가정으로 복귀할 수 있도록 BAYADA가 병원과 함께합니다. 퇴원 전 케어 플랜 수립부터 가정 내 전문 간호·재활 서비스 제공, 정기 모니터링까지 원스톱으로 지원합니다. 재입원율 감소와 환자 만족도 향상이라는 두 가지 목표를 동시에 달성하세요.",
    features: [
      {
        icon: "🔄",
        title: "재입원율 감소",
        description: "퇴원 후 72시간 이내 가정 방문 서비스로 합병증을 조기에 발견하고 재입원 위험을 평균 35% 줄입니다.",
      },
      {
        icon: "😊",
        title: "환자 만족도 향상",
        description: "환자와 가족이 퇴원 후에도 지속적인 케어를 받는다는 안심감으로 병원 서비스 만족도가 함께 올라갑니다.",
      },
      {
        icon: "📋",
        title: "원활한 전환 프로토콜",
        description: "병원 퇴원 팀과 BAYADA 케어 코디네이터가 실시간으로 협력하여 끊김 없는 케어 연속성을 보장합니다.",
      },
      {
        icon: "📊",
        title: "데이터 기반 성과 관리",
        description: "월별 재입원율, 환자 건강 지표, 케어 순응도 데이터를 병원 담당자와 공유하여 파트너십 효과를 투명하게 확인합니다.",
      },
    ],

    processSteps: [
      {
        title: "파트너십 문의 및 미팅",
        description: "병원 퇴원 관리팀과 BAYADA 파트너십 담당자가 만나 병원의 니즈와 현황을 파악합니다.",
      },
      {
        title: "니즈 분석 및 제안",
        description: "병원의 주요 진료과, 퇴원 패턴, 재입원 현황을 분석하여 맞춤형 전환의료 프로그램을 제안합니다.",
      },
      {
        title: "전환 프로토콜 수립",
        description: "양측 담당자가 퇴원 기준, 인계 절차, 응급 상황 대응 프로토콜을 함께 수립합니다.",
      },
      {
        title: "서비스 시작 및 성과 검토",
        description: "파트너십 개시 후 월별 성과 리뷰를 통해 재입원율 감소 효과를 확인하고 지속적으로 개선합니다.",
      },
    ],

    stats: [
      { value: "45+", label: "파트너 병원 수" },
      { value: "35", label: "평균 재입원율 감소", suffix: "%" },
      { value: "4.7", label: "파트너 병원 만족도", suffix: "/5.0" },
      { value: "92", label: "전환의료 성공률", suffix: "%" },
    ],

    testimonials: [
      {
        quote: "BAYADA와 파트너십을 맺은 후 우리 병원의 30일 재입원율이 눈에 띄게 줄었습니다. 퇴원 후 환자 관리가 이렇게 체계적으로 이루어지는 것을 보니 안심이 됩니다.",
        author: "이철수 원장",
        role: "서울 K 종합병원 내과",
      },
    ],

    learnMoreItems: [
      {
        title: "어떤 병원이 파트너십에 적합한가요?",
        content: "내과, 외과, 신경과, 정형외과 등 퇴원 후 재활이나 지속 케어가 필요한 환자가 많은 모든 규모의 병원과 협력합니다. 특히 재입원율 관리에 관심 있는 병원에 가장 효과적입니다.",
      },
      {
        title: "병원 EMR 시스템과 연동되나요?",
        content: "주요 EMR 시스템과의 데이터 연동을 지원합니다. 연동이 어려운 경우에도 전담 케어 코디네이터가 직접 병원 팀과 소통하여 정보를 인계받습니다.",
      },
      {
        title: "파트너십 계약 형태는 어떻게 되나요?",
        content: "MOU 체결 후 시범 운영(3개월) → 정식 파트너십으로 진행됩니다. 병원 규모와 필요에 따라 서비스 범위와 조건을 유연하게 조정합니다.",
      },
      {
        title: "비용은 어떻게 산정되나요?",
        content: "환자에게 제공되는 서비스는 건강보험 급여 또는 비급여로 처리되며, 병원에 별도 파트너십 수수료를 부과하지 않습니다. 세부 내용은 상담을 통해 안내드립니다.",
      },
    ],

    relatedServices: ["transitional-care", "home-nursing", "rehabilitation"],
  },

  {
    slug: "clinics",
    type: "provider",
    nameEn: "Clinics",
    nameKo: "재택의료센터",
    description: "재택의료 서비스를 통한 클리닉 연계 서비스를 제공합니다.",
    icon: "🏪",
    image: "/images/audiences/clinics.jpg",
    href: "/who-we-serve/providers/medical-institutes/clinics",
    highlights: [
      "재택의료 서비스 연계",
      "전문 인력 파견",
      "환자 관리 시스템",
      "데이터 기반 품질 관리",
    ],
    ctaLabel: "파트너십 문의",
    ctaHref: "/who-we-serve/providers/medical-institutes/clinics",

    contentHeadline: "의원·클리닉과 함께하는\n재택의료 서비스 연계",
    features: [
      {
        icon: "🏠",
        title: "재택의료 서비스 연계",
        description: "의원에서 진료 후 가정에서 지속 케어가 필요한 환자를 BAYADA와 연계하여 끊김 없는 의료 서비스를 제공합니다.",
      },
      {
        icon: "👨‍⚕️",
        title: "전문 인력 파견",
        description: "클리닉의 진료 방침에 맞는 숙련된 방문간호사 및 요양보호사를 파견하여 의원 처방을 가정에서 실행합니다.",
      },
      {
        icon: "📱",
        title: "통합 환자 관리",
        description: "클리닉 담당의와 BAYADA 케어팀이 환자 상태를 공유하는 협력 체계로 진료 연속성을 높입니다.",
      },
    ],

    stats: [
      { value: "120+", label: "연계 클리닉 수" },
      { value: "98", label: "서비스 연속성 유지율", suffix: "%" },
      { value: "4.6", label: "클리닉 파트너 만족도", suffix: "/5.0" },
    ],

    faqs: [
      {
        question: "의원 규모와 관계없이 파트너십이 가능한가요?",
        answer: "네, 1인 개원의부터 다과목 의원까지 규모에 관계없이 파트너십을 진행합니다. 파견 인력 규모와 서비스 범위는 의원의 환자 수에 따라 유연하게 조정됩니다.",
      },
      {
        question: "환자 연계 절차는 어떻게 되나요?",
        answer: "의원에서 재택 케어가 필요한 환자를 확인하면 BAYADA 코디네이터에게 연락하고, 24시간 이내에 케어 플랜을 수립하여 서비스를 시작합니다.",
      },
      {
        question: "파견 인력의 자격은 어떻게 검증하나요?",
        answer: "모든 파견 인력은 국가 자격증 보유자이며, BAYADA 자체 역량 평가와 정기 보수교육을 이수한 인원만 현장에 투입합니다.",
      },
    ],

    learnMoreItems: [
      {
        title: "어떤 진료과와 연계되나요?",
        content: "내과(당뇨·고혈압·만성질환), 신경과(치매·뇌졸중), 정형외과(근골격계 재활), 종양내과(완화의료) 등 다양한 진료과와 협력합니다.",
      },
      {
        title: "파트너십 시작 절차",
        content: "파트너십 신청 후 담당자가 방문하여 의원 현황을 파악하고, 1주일 이내에 서비스 연계 프로토콜을 완성합니다.",
      },
      {
        title: "비용 처리 방식",
        content: "환자에게 제공되는 서비스 비용은 건강보험 또는 장기요양보험으로 처리되며, 의원은 별도 비용 없이 연계 서비스를 이용할 수 있습니다.",
      },
      {
        title: "의원 환자의 프라이버시 보호",
        content: "개인정보보호법 및 의료법에 따라 환자 정보를 엄격하게 관리합니다. 정보 공유는 환자 동의 후에만 이루어집니다.",
      },
    ],
  },

  {
    slug: "ltci-center",
    type: "provider",
    nameEn: "LTCI Center",
    nameKo: "노인장기요양센터",
    description: "노인장기요양보험 수급자 케어를 위한 파트너십을 제공합니다.",
    icon: "🏠",
    image: "/images/audiences/ltci-center.jpg",
    href: "/who-we-serve/providers/service-provision-centers/ltci",
    highlights: [
      "수급자 케어 파트너십",
      "운영 컨설팅",
      "인력 교육 지원",
      "품질 인증 프로그램",
    ],
    ctaLabel: "상세보기",
    ctaHref: "/who-we-serve/providers/service-provision-centers/ltci",

    contentHeadline: "장기요양센터의 서비스 품질을\nBAYADA가 함께 높입니다",
    features: [
      {
        icon: "⭐",
        title: "품질 인증 프로그램",
        description: "BAYADA 글로벌 품질 기준을 기반으로 장기요양기관 평가에서 우수 등급을 받을 수 있도록 체계적으로 지원합니다.",
      },
      {
        icon: "👩‍🏫",
        title: "인력 교육 지원",
        description: "요양보호사, 사회복지사, 물리치료사 등 전 직군에 대한 직무 교육과 리더십 프로그램을 제공합니다.",
      },
      {
        icon: "📋",
        title: "운영 컨설팅",
        description: "케어 플랜 수립, 수급자 관리 시스템, 기관 운영 효율화에 대한 실무 중심 컨설팅을 제공합니다.",
      },
      {
        icon: "🔗",
        title: "전문 인력 네트워크 연결",
        description: "인력 부족 시 BAYADA 소속 전문 인력을 빠르게 지원하여 서비스 공백을 막습니다.",
      },
      {
        icon: "📊",
        title: "데이터 기반 성과 관리",
        description: "수급자 건강 지표, 서비스 이용 현황, 직원 역량 데이터를 분석하여 기관 경쟁력을 높이는 인사이트를 제공합니다.",
      },
    ],

    processSteps: [
      {
        title: "상담 신청",
        description: "파트너십 신청 페이지 또는 전화로 기관 현황과 필요 사항을 간략히 알려주세요.",
      },
      {
        title: "현황 진단",
        description: "BAYADA 컨설턴트가 기관을 방문하여 인력 구성, 케어 수준, 운영 프로세스를 진단합니다.",
      },
      {
        title: "맞춤 프로그램 제안",
        description: "진단 결과를 바탕으로 교육, 컨설팅, 인력 지원 등 맞춤형 파트너십 프로그램을 제안합니다.",
      },
      {
        title: "프로그램 실행",
        description: "합의된 프로그램을 단계별로 실행하며, 월별 성과 리뷰를 통해 효과를 측정하고 조정합니다.",
      },
      {
        title: "지속적 파트너십",
        description: "기관의 성장 단계에 따라 파트너십 내용을 확대하고, 장기적인 서비스 품질 향상을 함께 추구합니다.",
      },
    ],

    stats: [
      { value: "80+", label: "파트너 장기요양기관 수" },
      { value: "2등급 이상", label: "파트너 기관 평균 평가 등급" },
      { value: "95", label: "파트너 기관 재계약률", suffix: "%" },
      { value: "40", label: "평균 역량 향상", suffix: "%" },
    ],

    learnMoreItems: [
      {
        title: "파트너십 지원 범위",
        content: "방문요양, 방문목욕, 방문간호, 주·야간보호, 단기보호 등 모든 장기요양 서비스 유형의 기관을 지원합니다.",
      },
      {
        title: "교육 프로그램 내용",
        content: "치매 전문 케어, 욕창 예방, 이동 지원, 의사소통 기술, 응급처치, 기관 평가 대응 교육 등 실무에 즉시 적용 가능한 커리큘럼을 운영합니다.",
      },
      {
        title: "기관 평가 지원",
        content: "노인장기요양기관 정기 평가 전 모의 평가를 실시하고, 개선 사항을 사전에 점검하여 우수 등급 획득을 지원합니다.",
      },
      {
        title: "계약 조건",
        content: "기본 12개월 파트너십 계약을 기준으로 하며, 기관 규모와 필요에 따라 서비스 패키지와 비용을 맞춤 설정합니다.",
      },
    ],
  },

  {
    slug: "nursing-visit-center",
    type: "provider",
    nameEn: "Nursing Visit Center",
    nameKo: "방문간호센터",
    description: "방문간호 서비스 제공을 위한 파트너십을 제공합니다.",
    icon: "🩺",
    image: "/images/audiences/nursing-visit.jpg",
    href: "/who-we-serve/providers/service-provision-centers/nursing-visit",
    highlights: [
      "방문간호 파트너십",
      "간호 인력 교육",
      "서비스 품질 관리",
      "DeiCloud 운영 시스템",
    ],
    ctaLabel: "상세보기",
    ctaHref: "/who-we-serve/providers/service-provision-centers/nursing-visit",

    contentHeadline: "방문간호센터를 위한\n전문 인력과 품질 관리 솔루션",
    features: [
      {
        icon: "👩‍⚕️",
        title: "숙련 방문간호사 지원",
        description: "센터 인력 공백 시 BAYADA 소속 숙련 간호사를 신속하게 지원하여 서비스 연속성을 보장합니다.",
      },
      {
        icon: "📚",
        title: "전문 교육 지원",
        description: "임상 역량 강화 교육, 법적 기록 작성 교육, 최신 가이드라인 업데이트 교육을 정기적으로 제공합니다.",
      },
      {
        icon: "✅",
        title: "서비스 품질 관리",
        description: "케어 수행 모니터링, 기록 검토, 정기 슈퍼비전으로 센터 전반의 서비스 품질을 체계적으로 관리합니다.",
      },
      {
        icon: "💻",
        title: "운영 시스템 연동",
        description: "DeiCloud 기반 방문간호 운영 시스템과 연동하여 업무 효율을 높이고 오류를 줄입니다.",
      },
    ],

    stats: [
      { value: "60+", label: "파트너 방문간호센터 수" },
      { value: "99", label: "서비스 공백 없이 처리된 사례 비율", suffix: "%" },
      { value: "4.8", label: "파트너 센터 만족도", suffix: "/5.0" },
    ],

    testimonials: [
      {
        quote: "갑작스러운 간호사 결원이 생겼을 때 BAYADA에서 당일 대체 인력을 지원해 줘서 정말 도움이 됐습니다. 지원된 간호사의 역량도 우리 기준에 딱 맞았어요.",
        author: "최미영 센터장",
        role: "서울 H 방문간호센터",
      },
    ],

    faqs: [
      {
        question: "인력 지원 요청 후 얼마나 빨리 파견되나요?",
        answer: "긴급 요청 시 24시간 이내, 일반 요청은 48~72시간 이내에 적합한 인력을 매칭하여 안내드립니다.",
      },
      {
        question: "파트너십을 맺지 않아도 단기 인력 지원을 받을 수 있나요?",
        answer: "기본 협약을 체결한 센터에 한해 인력 지원이 가능합니다. 협약 절차는 간단하며 1~2일 내 완료됩니다.",
      },
      {
        question: "DeiCloud 시스템 도입이 필수인가요?",
        answer: "필수는 아닙니다. 기존 센터 운영 시스템을 유지하면서 파트너십을 진행할 수 있으며, DeiCloud 도입 시 추가 혜택을 제공합니다.",
      },
    ],
  },

  {
    slug: "daycare",
    type: "provider",
    nameEn: "Daycare Center",
    nameKo: "데이케어센터",
    description: "주간보호 서비스를 위한 파트너십을 제공합니다.",
    icon: "☀️",
    image: "/images/audiences/daycare.jpg",
    href: "/who-we-serve/providers/service-provision-centers/daycare",
    highlights: [
      "주간보호 파트너십",
      "프로그램 컨설팅",
      "인력 교육 지원",
      "품질 관리 시스템",
    ],
    ctaLabel: "상세보기",
    ctaHref: "/who-we-serve/providers/service-provision-centers/daycare",

    contentHeadline: "데이케어센터의 경쟁력을\n한 단계 높이는 파트너",
    features: [
      {
        icon: "🎯",
        title: "특화 프로그램 컨설팅",
        description: "인지훈련, 낙상예방 운동, 미술·음악 치료 등 이용자 중심의 특화 프로그램 개발을 함께 설계합니다.",
      },
      {
        icon: "👩‍🏫",
        title: "직원 역량 강화 교육",
        description: "치매 케어, 행동 심리 증상 대응, 이용자 의사소통 기술 등 현장 중심 교육으로 직원 역량을 높입니다.",
      },
      {
        icon: "📊",
        title: "이용자 건강 모니터링",
        description: "이용자 건강 지표 추적, 가족 리포트 제공, 의료기관 연계 등 통합 건강 관리 시스템을 지원합니다.",
      },
      {
        icon: "🏆",
        title: "기관 평가 대응 지원",
        description: "노인장기요양기관 평가를 앞두고 모의 평가와 개선 계획 수립으로 우수 등급 획득을 목표로 합니다.",
      },
    ],

    stats: [
      { value: "55+", label: "파트너 데이케어센터 수" },
      { value: "30", label: "프로그램 다양성 향상", suffix: "%" },
      { value: "4.5", label: "파트너 센터 만족도", suffix: "/5.0" },
    ],

    learnMoreItems: [
      {
        title: "어떤 프로그램을 개발해 주나요?",
        content: "인지훈련(퍼즐·회상·구술 활동), 신체 기능 유지(밸런스 운동·스트레칭), 정서 지원(음악 치료·미술 활동), 사회 참여 프로그램 등 이용자 특성에 맞는 커리큘럼을 개발합니다.",
      },
      {
        title: "컨설팅 방문 주기는 어떻게 되나요?",
        content: "월 1~2회 정기 방문 컨설팅을 기본으로 하며, 긴급 현안이 발생한 경우 추가 지원을 제공합니다.",
      },
      {
        title: "이용자 가족 소통 지원",
        content: "주간 케어 리포트, 이벤트 사진 제공, 보호자 상담 지원 등 가족과의 소통을 강화하는 도구를 제공합니다.",
      },
      {
        title: "파트너십 비용은 어떻게 되나요?",
        content: "센터 규모와 필요 서비스에 따라 월정액 컨설팅 패키지로 운영됩니다. 초기 1개월 무료 진단 서비스를 제공합니다.",
      },
    ],

    careerTitle: "데이케어 전문 인력을 채용하고 싶으신가요?",
    careerDescription: "BAYADA의 인재 네트워크를 통해 검증된 요양보호사, 사회복지사, 프로그램 강사를 빠르게 채용하세요.",
  },

  {
    slug: "local-government",
    type: "provider",
    nameEn: "Local Government",
    nameKo: "지자체",
    description: "데이터 기반 공공 홈헬스케어 솔루션과 모범 프로그램 컨설팅을 제공합니다.",
    icon: "🏛️",
    image: "/images/audiences/local-government.jpg",
    href: "/who-we-serve/providers/local-government",
    highlights: [
      "모범 프로그램 컨설팅",
      "홈헬스케어 품질관리",
      "경제성 평가",
      "데이터 기반 정책 지원",
    ],
    ctaLabel: "컨설팅 상담 신청",
    ctaHref: "/who-we-serve/providers/local-government",

    contentHeadline: "지역사회 돌봄 체계 구축을 위한\n전문 컨설팅 파트너",
    features: [
      {
        icon: "📜",
        title: "정책 컨설팅",
        description: "미국·유럽의 선진 홈헬스케어 정책 사례를 분석하여 지자체 실정에 맞는 돌봄 정책 수립을 지원합니다.",
      },
      {
        icon: "🎓",
        title: "인력 양성 프로그램",
        description: "지역 내 돌봄 인력의 체계적 양성을 위한 교육 커리큘럼 개발과 강사진 지원을 제공합니다.",
      },
      {
        icon: "🔍",
        title: "품질 관리 시스템 구축",
        description: "지역 내 홈헬스케어 서비스 제공기관의 품질을 객관적으로 평가하고 개선을 유도하는 시스템을 구축합니다.",
      },
      {
        icon: "📊",
        title: "데이터 기반 정책 지원",
        description: "지역 돌봄 수요 예측, 자원 배분 최적화, 정책 효과 분석 등 데이터 기반 의사결정을 지원합니다.",
      },
    ],

    processSteps: [
      {
        title: "초기 상담",
        description: "지자체 복지 담당 부서와 BAYADA 공공 파트너십팀이 지역 현황과 필요 과제를 파악합니다.",
      },
      {
        title: "현황 진단 및 분석",
        description: "지역 내 돌봄 수요, 기존 서비스 체계, 자원 현황을 종합적으로 분석하여 진단 보고서를 작성합니다.",
      },
      {
        title: "컨설팅 계획 수립",
        description: "진단 결과를 바탕으로 정책 제안, 인력 양성 계획, 품질 관리 로드맵을 포함한 컨설팅 계획을 제안합니다.",
      },
      {
        title: "프로그램 실행",
        description: "합의된 계획에 따라 교육, 시스템 구축, 시범 사업 등을 순차적으로 실행합니다.",
      },
      {
        title: "성과 평가 및 정책 환류",
        description: "사업 효과를 객관적으로 평가하고, 결과를 정책 개선에 반영하여 지속 발전 가능한 돌봄 체계를 완성합니다.",
      },
    ],

    stats: [
      { value: "15+", label: "협력 지자체 수" },
      { value: "8개 광역시도", label: "서비스 지원 지역" },
      { value: "20", label: "평균 돌봄 서비스 접근성 향상", suffix: "%" },
      { value: "3건+", label: "정부 우수 사례 선정" },
    ],

    learnMoreItems: [
      {
        title: "공공 파트너십 계약 방식",
        content: "지자체의 공공 입찰·수의계약 방식 모두 가능합니다. 연구 용역, 교육 위탁, 품질 평가 대행 등 다양한 형태로 협력합니다.",
      },
      {
        title: "참고 가능한 해외 사례",
        content: "BAYADA가 운영하는 미국·캐나다·독일의 공공 홈헬스케어 프로그램 사례를 번역·분석하여 제공합니다. 현지 담당자와의 화상 세미나 연결도 지원합니다.",
      },
      {
        title: "소규모 지자체도 지원 가능한가요?",
        content: "네, 인구 10만 이하 소규모 지자체도 맞춤형 컨설팅을 제공합니다. 광역자치단체와 기초자치단체 모두 지원 가능합니다.",
      },
    ],
  },
];

// 서비스 이용자 세그먼트 (FR-W-004)
export const userSegments: AudienceSegment[] = [
  {
    slug: "senior",
    type: "user",
    nameEn: "Senior",
    nameKo: "시니어",
    description: "65세 이상 어르신을 위한 전문 홈헬스케어 서비스입니다. 맞춤형 케어 플랜과 전문 인력을 통해 안전하고 편안한 생활을 지원합니다.",
    icon: "👴",
    image: "/images/audiences/senior.jpg",
    href: "/who-we-serve/users/senior",
    highlights: [
      "전문 방문 간호 서비스",
      "맞춤형 방문 요양",
      "낙상 예방 운동 프로그램",
      "인지 훈련 프로그램",
    ],
    ctaLabel: "서비스 보기",
    ctaHref: "/who-we-serve/users/senior",

    contentHeadline: "어르신의 존엄한 일상을\n가정에서 지켜드립니다",
    contentDescription:
      "BAYADA는 65세 이상 어르신이 익숙한 가정환경에서 안전하고 편안하게 생활할 수 있도록 전문 케어를 제공합니다. 단순한 생활 지원을 넘어 전문 간호, 재활, 정서 케어까지 아우르는 통합 서비스로 어르신과 가족 모두의 삶의 질을 높입니다. 모든 케어는 개인 상황에 맞는 맞춤형 플랜으로 설계됩니다.",
    contentImageUrl: "/images/audiences/senior-care.webp",

    features: [
      {
        icon: "💉",
        title: "전문 방문 간호",
        description: "국가 자격을 갖춘 방문간호사가 투약 관리, 상처 처치, 혈당·혈압 모니터링 등 전문 간호 서비스를 가정에서 제공합니다.",
      },
      {
        icon: "🍱",
        title: "일상생활 지원",
        description: "식사 준비, 청소, 세탁, 장보기 등 일상의 작은 부분부터 목욕·이동 지원까지 어르신의 생활 전반을 돕습니다.",
      },
      {
        icon: "❤️",
        title: "건강 상태 관리",
        description: "정기적인 바이탈 체크, 건강 변화 모니터링, 주치의 및 전문의 연계로 어르신의 건강을 지속적으로 관리합니다.",
      },
      {
        icon: "😊",
        title: "정서·심리 케어",
        description: "전담 케어 매니저와의 정기적인 소통, 회상 치료, 취미 활동 지원으로 어르신의 정서적 건강을 챙깁니다.",
      },
      {
        icon: "🔒",
        title: "안전 관리",
        description: "낙상 예방 환경 점검, 야간 안전 모니터링, 응급 상황 대응 체계로 어르신이 안전한 환경에서 생활할 수 있도록 합니다.",
      },
      {
        icon: "👨‍👩‍👧",
        title: "가족 지원 서비스",
        description: "보호자 부담 경감 상담, 케어 방법 교육, 정기 케어 리포트 제공으로 가족도 안심할 수 있는 돌봄 환경을 만듭니다.",
      },
    ],

    processSteps: [
      {
        title: "무료 상담 신청",
        description: "전화(1670-1379) 또는 온라인 상담 신청으로 어르신의 현재 상황과 필요한 서비스를 말씀해 주세요.",
      },
      {
        title: "전문 케어 평가",
        description: "케어 매니저가 직접 가정을 방문하여 어르신의 건강 상태, 생활 환경, 가족의 요구 사항을 종합적으로 평가합니다.",
      },
      {
        title: "맞춤형 케어 플랜 수립",
        description: "평가 결과를 바탕으로 어르신과 가족과 함께 서비스 내용, 방문 일정, 담당 케어 인력을 결정합니다.",
      },
      {
        title: "서비스 시작",
        description: "담당 케어 인력이 첫 방문하여 서비스를 시작합니다. 처음에는 어르신이 익숙해질 수 있도록 세심하게 진행합니다.",
      },
      {
        title: "정기 리뷰 및 케어 조정",
        description: "월별 케어 리뷰를 통해 어르신의 상태 변화를 파악하고 케어 플랜을 지속적으로 업데이트합니다.",
      },
    ],

    stats: [
      { value: "5,000+", label: "누적 시니어 이용자 수" },
      { value: "98", label: "이용자·가족 만족도", suffix: "%" },
      { value: "70개 이상", label: "서비스 제공 지역" },
      { value: "3,500+", label: "전문 케어 인력 수" },
    ],

    testimonials: [
      {
        quote: "처음에는 낯선 사람이 집에 오는 게 불편하셨는데, 지금은 담당 간호사 선생님을 손녀처럼 좋아하세요. 어머니 건강도 좋아지고 저도 마음이 편해졌어요.",
        author: "박성훈",
        role: "80대 어머니 보호자",
      },
      {
        quote: "혼자 사는 게 걱정됐는데, BAYADA 선생님들 덕분에 내 집에서 편하게 지낼 수 있어요. 아플 때도 빨리 도움을 받을 수 있어서 안심이 됩니다.",
        author: "김복순 어르신",
        role: "77세, 서비스 이용 2년 차",
      },
    ],

    faqs: [
      {
        question: "장기요양보험으로 비용 지원을 받을 수 있나요?",
        answer: "네, 장기요양 1~5등급(인지지원등급 포함) 판정을 받으신 어르신은 장기요양보험 급여를 적용받을 수 있습니다. 등급에 따라 본인 부담금이 다르며, 상담 시 자세히 안내해 드립니다.",
      },
      {
        question: "서비스 시작까지 얼마나 걸리나요?",
        answer: "상담 신청 후 케어 평가를 거쳐 빠르면 3~5일 이내에 서비스를 시작할 수 있습니다. 긴급한 경우 더 빠른 시작도 가능하오니 상담 시 말씀해 주세요.",
      },
      {
        question: "케어 인력을 직접 선택할 수 있나요?",
        answer: "케어 코디네이터가 어르신의 상황과 성향에 가장 잘 맞는 인력을 매칭하며, 첫 방문 후 어르신 또는 가족의 요청으로 교체도 가능합니다.",
      },
      {
        question: "야간이나 주말에도 서비스가 가능한가요?",
        answer: "네, 야간 및 주말 서비스도 제공합니다. 24시간 상주 케어가 필요한 경우에도 맞춤형으로 지원 가능합니다. 비용은 시간대에 따라 달라집니다.",
      },
      {
        question: "어르신이 요양병원 입원 중인데 퇴원 후 바로 연계할 수 있나요?",
        answer: "퇴원 전부터 케어 플랜을 미리 수립하여 퇴원 당일부터 서비스를 시작할 수 있습니다. 병원 퇴원 팀과 직접 협력하여 원활한 전환을 도와드립니다.",
      },
    ],

    learnMoreItems: [
      {
        title: "어떤 서비스 유형을 선택할 수 있나요?",
        content: "방문간호(전문 간호 처치), 방문요양(일상생활 지원), 방문 운동·재활, 주간보호(데이케어), 24시간 케어 등 다양한 서비스 유형을 단독 또는 복합으로 이용할 수 있습니다.",
      },
      {
        title: "비용은 얼마나 드나요?",
        content: "장기요양등급 보유 시 본인 부담금은 급여 서비스의 15~20% 수준입니다. 비급여 서비스는 시간당 요금이 적용되며, 구체적인 비용은 상담을 통해 안내받으실 수 있습니다.",
      },
      {
        title: "장기요양등급을 신청하려면 어떻게 하나요?",
        content: "국민건강보험공단(1577-1000)에 신청하거나 가까운 공단 지사를 방문하면 됩니다. BAYADA 케어 매니저가 신청 방법을 안내해 드리며, 필요시 도움도 드립니다.",
      },
      {
        title: "서비스를 중단하거나 변경하고 싶을 때는?",
        content: "서비스 중단 및 변경은 사전 통보 후 언제든지 가능합니다. 어르신의 상태 변화에 따라 서비스 내용을 유연하게 조정할 수 있습니다.",
      },
      {
        title: "건강보험과 장기요양보험은 어떻게 다른가요?",
        content: "건강보험은 질병 치료를 위한 의료 서비스를 보장하고, 장기요양보험은 일상생활 지원과 돌봄 서비스를 보장합니다. BAYADA는 두 보험 모두 적용 가능한 서비스를 제공합니다.",
      },
    ],

    careerTitle: "어르신 케어에 헌신하는 분들을 찾습니다",
    careerDescription: "시니어 케어 분야에서 BAYADA와 함께 의미 있는 커리어를 시작하세요. 방문간호사, 요양보호사, 케어 코디네이터 등 다양한 직군을 채용합니다.",
  },

  {
    slug: "chronic-disease",
    type: "user",
    nameEn: "Chronic Disease Management",
    nameKo: "만성질환관리",
    description: "만성질환 환자의 지속적인 건강 관리를 지원합니다. 당뇨, 고혈압, 치매, 뇌졸중 등 질환별 맞춤 케어를 제공합니다.",
    icon: "❤️‍🩹",
    image: "/images/audiences/chronic-disease.jpg",
    href: "/who-we-serve/users/chronic-disease",
    highlights: [
      "질환별 맞춤 케어",
      "복약 관리 서비스",
      "정기 건강 모니터링",
      "환우회 연결 지원",
    ],
    ctaLabel: "서비스 보기",
    ctaHref: "/who-we-serve/users/chronic-disease",

    contentHeadline: "만성질환과 함께하는 일상,\nBAYADA가 든든히 지원합니다",

    features: [
      {
        icon: "🩺",
        title: "질환별 전문 케어",
        description: "당뇨, 고혈압, 치매, 뇌졸중, 심부전, 만성폐쇄성폐질환 등 각 질환의 특성에 맞는 전문 간호 프로토콜을 적용합니다.",
      },
      {
        icon: "💊",
        title: "복약 관리 서비스",
        description: "복잡한 복약 스케줄을 체계적으로 관리하고, 복약 순응도를 높여 합병증 예방 효과를 극대화합니다.",
      },
      {
        icon: "📡",
        title: "원격 건강 모니터링",
        description: "혈압계·혈당계·산소포화도 측정기 등과 연동된 모니터링 시스템으로 이상 징후를 조기에 발견하고 대응합니다.",
      },
      {
        icon: "🏥",
        title: "의료기관 연계 케어",
        description: "주치의·전문의와 긴밀하게 협력하여 가정 케어와 병원 진료 사이의 일관성 있는 치료 연속성을 보장합니다.",
      },
      {
        icon: "🧘",
        title: "생활습관 코칭",
        description: "식이 요법, 적정 운동, 스트레스 관리 등 질환 악화를 막는 건강한 생활습관 형성을 전문가가 함께 지원합니다.",
      },
    ],

    processSteps: [
      {
        title: "질환 상태 평가",
        description: "전문 간호사가 현재 질환 상태, 복약 현황, 합병증 위험도를 종합적으로 평가합니다.",
      },
      {
        title: "맞춤형 케어 플랜 수립",
        description: "질환별 특성과 환자 개인 상황을 반영한 케어 플랜을 주치의와 협력하여 수립합니다.",
      },
      {
        title: "정기 방문 케어 시작",
        description: "전담 간호사가 주기적으로 방문하여 건강 모니터링, 복약 지도, 생활습관 코칭을 진행합니다.",
      },
      {
        title: "지속적인 케어 조정",
        description: "질환 변화와 검사 결과에 따라 케어 플랜을 지속적으로 업데이트하며 합병증 예방에 집중합니다.",
      },
    ],

    stats: [
      { value: "40", label: "합병증 발생률 감소", suffix: "%" },
      { value: "4.8", label: "이용자 만족도", suffix: "/5.0" },
      { value: "85", label: "복약 순응도 향상", suffix: "%" },
    ],

    faqs: [
      {
        question: "어떤 만성질환을 지원하나요?",
        answer: "당뇨병, 고혈압, 고지혈증, 치매, 뇌졸중 후유증, 만성심부전, 만성폐쇄성폐질환(COPD), 파킨슨병, 암 환자 호스피스 케어 등 다양한 만성질환을 지원합니다.",
      },
      {
        question: "방문 간격은 어떻게 결정되나요?",
        answer: "질환 중증도와 환자 상태에 따라 주 1회에서 매일 방문까지 유연하게 조정합니다. 상태 변화 시 즉시 방문 횟수를 늘릴 수 있습니다.",
      },
      {
        question: "원격 모니터링 장비는 어떻게 이용하나요?",
        answer: "BAYADA에서 가정에 모니터링 기기를 설치하고 사용법을 교육합니다. 측정된 데이터는 자동으로 케어팀에 전달되어 이상 징후 시 즉시 연락합니다.",
      },
      {
        question: "병원 치료와 병행할 수 있나요?",
        answer: "물론입니다. BAYADA의 가정 케어는 병원 치료를 보완하는 역할을 합니다. 주치의와 정보를 공유하여 치료의 일관성을 유지합니다.",
      },
    ],

    learnMoreItems: [
      {
        title: "당뇨병 관리 서비스",
        content: "혈당 모니터링, 인슐린 주사 관리, 당뇨발 상처 케어, 식이 요법 지도를 전문 간호사가 가정에서 제공합니다. 합병증 예방에 특화된 프로토콜을 적용합니다.",
      },
      {
        title: "고혈압 관리 서비스",
        content: "정기 혈압 측정, 복약 관리, 저염식 식이 교육, 스트레스 관리 코칭으로 혈압을 안정적으로 유지하고 뇌졸중·심장질환 위험을 줄입니다.",
      },
      {
        title: "치매 케어 서비스",
        content: "인지 기능 훈련, 행동심리증상(BPSD) 대응, 가족 케어 교육을 전문 치매 케어 인력이 제공합니다. 환자와 가족 모두의 삶의 질 향상을 목표로 합니다.",
      },
      {
        title: "복약 관리 전문 서비스",
        content: "다수의 약제를 복용하는 환자의 복잡한 복약 스케줄을 체계적으로 관리하고, 약물 상호작용과 부작용을 모니터링하여 안전한 복약을 지원합니다.",
      },
      {
        title: "원격 모니터링 시스템",
        content: "혈압, 혈당, 산소포화도, 체중 등의 생체 지표를 가정에서 측정하면 실시간으로 케어팀에 전달됩니다. 이상 수치 감지 시 즉각 대응합니다.",
      },
    ],
  },

  {
    slug: "disability",
    type: "user",
    nameEn: "Disability Support",
    nameKo: "장애인생활관리",
    description: "장애인의 일상생활을 종합적으로 지원하는 서비스입니다. 개인 맞춤 돌봄, 재활, 사회 참여를 지원합니다.",
    icon: "♿",
    image: "/images/audiences/disability.jpg",
    href: "/who-we-serve/users/disability",
    highlights: [
      "일상생활 지원 서비스",
      "재활 프로그램",
      "사회 참여 지원",
      "장애인단체 연결",
    ],
    ctaLabel: "서비스 보기",
    ctaHref: "/who-we-serve/users/disability",

    contentHeadline: "장애인의 독립적인 삶을\n전문 케어로 지원합니다",

    features: [
      {
        icon: "🏠",
        title: "일상생활 지원",
        description: "식사, 이동, 위생 관리, 가사 지원 등 일상의 모든 영역에서 장애인의 자립적인 생활을 도와드립니다.",
      },
      {
        icon: "🏋️",
        title: "재활 프로그램",
        description: "물리치료사·작업치료사가 제공하는 가정 방문 재활 서비스로 기능 회복과 유지를 지원합니다.",
      },
      {
        icon: "🤝",
        title: "사회 참여 지원",
        description: "외출 동행, 문화·여가 활동 참여, 직업 재활 연계 등 지역사회 활동에 적극 참여할 수 있도록 지원합니다.",
      },
      {
        icon: "🔗",
        title: "관련 기관·서비스 연계",
        description: "장애인복지관, 활동지원기관, 의료기관, 보조기기 지원 등 필요한 자원과 서비스에 연결해 드립니다.",
      },
    ],

    processSteps: [
      {
        title: "초기 상담 및 욕구 평가",
        description: "전문 케어 매니저가 장애 유형, 일상 기능 수준, 원하는 삶의 모습 등 개인 욕구를 면밀히 파악합니다.",
      },
      {
        title: "개인 맞춤 지원 계획 수립",
        description: "평가 결과와 당사자 의견을 바탕으로 일상생활 지원, 재활, 사회 참여를 포함한 통합 지원 계획을 수립합니다.",
      },
      {
        title: "서비스 시작 및 적응 지원",
        description: "담당 활동지원사·재활 전문가가 배치되어 서비스를 시작하며, 초기 적응 기간 동안 세심하게 모니터링합니다.",
      },
      {
        title: "정기 평가 및 지원 조정",
        description: "분기별로 지원 효과를 평가하고 장애인의 변화하는 필요에 맞춰 지원 내용을 조정합니다.",
      },
    ],

    stats: [
      { value: "800+", label: "장애인 이용자 수" },
      { value: "95", label: "이용자 자립도 향상 비율", suffix: "%" },
      { value: "60+", label: "연계 지원 기관 수" },
    ],

    testimonials: [
      {
        quote: "BAYADA 덕분에 혼자서 외출도 하고 원하는 활동을 할 수 있게 됐습니다. 저를 도구가 아닌 한 사람으로 존중해 주는 케어 방식이 정말 고맙습니다.",
        author: "정민준",
        role: "지체장애 2급, 서비스 이용 1년 차",
      },
    ],

    faqs: [
      {
        question: "장애인 활동지원급여와 연계할 수 있나요?",
        answer: "네, 장애인 활동지원급여(보건복지부 활동지원제도) 및 장기요양 장애인 특례 서비스와 연계하여 본인 부담을 최소화할 수 있습니다. 급여 신청 방법도 안내해 드립니다.",
      },
      {
        question: "어떤 장애 유형을 지원하나요?",
        answer: "지체장애, 뇌병변장애, 시각·청각·언어장애, 지적장애, 자폐성장애, 정신장애, 신장·심장 등 내부기관 장애 등 모든 장애 유형을 지원합니다.",
      },
      {
        question: "아동 장애인도 서비스를 받을 수 있나요?",
        answer: "네, 성인 장애인뿐 아니라 아동 및 청소년 장애인도 연령과 장애 특성에 맞는 맞춤형 지원 서비스를 받을 수 있습니다.",
      },
    ],

    learnMoreItems: [
      {
        title: "일상생활 지원 범위",
        content: "개인위생(목욕·용변·세면), 식사 준비 및 섭취 지원, 가사 지원(청소·세탁·장보기), 이동 지원(휠체어·보행 보조), 의사소통 지원 등 일상 전 영역을 포괄합니다.",
      },
      {
        title: "재활 서비스 종류",
        content: "물리치료(근력 강화, 보행 훈련, 통증 관리), 작업치료(일상생활 기술 훈련, 보조기기 사용 교육), 언어치료(의사소통 훈련, 연하 재활) 등을 가정에서 제공합니다.",
      },
      {
        title: "사회 참여 지원 프로그램",
        content: "외출 동행(병원·관공서·문화시설), 자조 모임 연결, 직업 재활 기관 연계, 지역사회 자원봉사 활동 참여 지원 등으로 사회적 관계와 역할을 유지할 수 있도록 돕습니다.",
      },
      {
        title: "가족 지원 프로그램",
        content: "장애인 가족의 케어 부담 경감을 위한 심리 상담 연계, 케어 기술 교육, 단기 돌봄(휴식 지원) 서비스를 제공합니다.",
      },
    ],
  },
];
