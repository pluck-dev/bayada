import type { PlatformProduct } from "@/types";

// 4개 디지털 플랫폼 제품 (FR-W-006)
export const platforms: PlatformProduct[] = [
  {
    slug: "deibud",
    nameEn: "DeiBud",
    nameKo: "AI 케어 가이드",
    tagline: "AI-Powered Care Guide",
    description:
      "음성/텍스트 기반 AI 실시간 케어 가이드입니다. 질환 정보 안내, 맞춤 서비스 추천, 24시간 상담 지원, 케어 품질 데이터 자동 수집 기능을 제공합니다.",
    icon: "🤖",
    image: "/images/platform/deibud.jpg",
    href: "/platform/deibud",
    features: [
      "질환 정보 안내",
      "맞춤 서비스 추천",
      "24시간 상담 지원",
      "케어 품질 데이터 자동 수집",
      "음성/텍스트 모드 전환",
      "다국어 지원",
    ],
    ctaLabel: "DeiBud 체험하기",
    ctaHref: "/platform/deibud",
    status: "active",

    contentHeadline: "AI가 이끄는\n새로운 돌봄의 시작",
    contentDescription:
      "DeiBud는 50년 BAYADA 케어 노하우를 학습한 AI 가이드입니다. 어르신과 보호자가 언제 어디서나 전문적인 케어 정보를 얻고, 맞춤형 서비스를 추천받을 수 있도록 24시간 함께합니다. 음성과 텍스트 모두 지원하여 디지털 기기가 익숙하지 않은 어르신도 쉽게 사용할 수 있습니다.",
    contentImageUrl: "/images/platform/deibud-detail.jpg",

    keyFeatures: [
      {
        icon: "MessageSquare",
        title: "AI 맞춤 상담",
        description:
          "자연어 기반 대화로 질환 정보, 케어 방법, 서비스 안내를 24시간 제공합니다. 복잡한 의료 용어 없이 쉬운 말로 설명해드립니다.",
      },
      {
        icon: "Activity",
        title: "건강 상태 모니터링",
        description:
          "일상적인 건강 지표를 기록하고 이상 징후를 감지합니다. 변화 추이를 분석해 케어 전문가와 가족에게 즉시 알림을 전송합니다.",
      },
      {
        icon: "Sparkles",
        title: "개인 맞춤 추천",
        description:
          "이용자의 건강 상태, 선호도, 지역을 분석해 최적의 케어 서비스와 전문 인력을 추천합니다. AI가 매일 더 정확해집니다.",
      },
      {
        icon: "Users",
        title: "가족 연결 기능",
        description:
          "보호자가 원격으로 어르신의 케어 현황을 확인하고 AI와 소통할 수 있습니다. 가족 모두가 케어에 참여할 수 있습니다.",
      },
    ],

    useCases: [
      {
        title: "어르신 자가 건강 관리",
        description:
          "복약 시간 알림부터 운동 가이드, 식이 요법 안내까지 — DeiBud가 어르신의 일상 건강 관리를 도와드립니다. 음성 명령 하나로 필요한 모든 정보를 얻을 수 있어 스마트폰이 익숙하지 않아도 걱정 없습니다.",
      },
      {
        title: "보호자 원격 돌봄 지원",
        description:
          "멀리 떨어져 있어도 부모님의 건강 상태를 실시간으로 확인하세요. DeiBud는 이상 징후가 감지되면 즉시 알림을 보내고, 다음 단계 조치를 안내합니다. 바쁜 보호자도 안심할 수 있습니다.",
      },
      {
        title: "케어 전문가 업무 보조",
        description:
          "케어 매니저와 요양보호사가 서비스 기록을 음성으로 빠르게 입력하고, AI 분석 리포트를 활용해 더 나은 케어 계획을 수립할 수 있습니다. 행정 업무를 줄이고 케어에 집중하세요.",
      },
    ],

    stats: [
      { value: "98", label: "응답 정확도", suffix: "%" },
      { value: "50000", label: "월간 이용자", suffix: "+" },
      { value: "4.8", label: "이용자 만족도", suffix: "/5.0" },
    ],

    faqs: [
      {
        question: "DeiBud는 의사 처방을 대체할 수 있나요?",
        answer:
          "DeiBud는 의료 행위를 대체하지 않습니다. 일반적인 건강 정보와 케어 가이드를 제공하며, 응급 상황이나 의학적 판단이 필요한 경우 즉시 전문의 상담을 안내합니다. 정보 제공과 케어 조율 도구로 활용하시기 바랍니다.",
      },
      {
        question: "인터넷 연결 없이도 사용할 수 있나요?",
        answer:
          "기본적인 서비스는 인터넷 연결이 필요합니다. 다만, 앱에서 자주 사용하는 정보는 오프라인에서도 열람 가능하도록 캐싱 기능을 제공합니다. 응급 연락처 및 복약 알림은 오프라인 상태에서도 작동합니다.",
      },
      {
        question: "개인 건강 정보는 어떻게 보호되나요?",
        answer:
          "DeiBud는 국내 개인정보보호법 및 의료법 기준을 준수합니다. 모든 데이터는 AES-256 암호화로 저장되며, 사용자 동의 없이 제3자에게 절대 공유되지 않습니다. 언제든지 데이터 삭제를 요청하실 수 있습니다.",
      },
    ],
  },

  {
    slug: "deicloud",
    nameEn: "DeiCloud",
    nameKo: "운영 SaaS",
    tagline: "Healthcare Operations SaaS",
    description:
      "서비스 제공 기관을 위한 운영 관리 SaaS 플랫폼입니다. 인력 관리, 일정 관리, 서비스 기록 관리, 품질 모니터링, 전자계약, 정산 관리 기능을 제공합니다.",
    icon: "☁️",
    image: "/images/platform/deicloud.jpg",
    href: "/platform/deicloud",
    features: [
      "인력 관리",
      "일정 관리",
      "서비스 기록 관리",
      "품질 모니터링",
      "전자계약",
      "정산 관리",
    ],
    ctaLabel: "DeiCloud 알아보기",
    ctaHref: "/platform/deicloud",
    status: "coming-soon",

    contentHeadline: "돌봄 기관의 운영 효율을\n혁신하는 클라우드 플랫폼",
    contentDescription:
      "DeiCloud는 재가요양 기관, 복지관, 병원 부설 케어센터 등 돌봄 서비스 제공 기관을 위한 올인원 운영 관리 플랫폼입니다. 복잡한 인력 스케줄링부터 정부 청구까지 하나의 시스템으로 통합 관리하여 행정 부담을 획기적으로 줄입니다.",
    contentImageUrl: "/images/platform/deicloud-detail.jpg",

    keyFeatures: [
      {
        icon: "Calendar",
        title: "스마트 스케줄 관리",
        description:
          "AI 기반 자동 일정 배정으로 케어 인력과 이용자를 최적 매칭합니다. 변경 사항 발생 시 실시간 알림으로 혼선을 방지합니다.",
      },
      {
        icon: "Users",
        title: "인력 배치 최적화",
        description:
          "케어 인력의 자격증, 경력, 위치, 선호도를 종합 분석해 최적 배치를 제안합니다. 인력 활용률을 극대화하고 공백을 최소화합니다.",
      },
      {
        icon: "CreditCard",
        title: "청구·정산 자동화",
        description:
          "건강보험공단 전자청구, 본인부담금 수납, 기관 정산까지 자동화합니다. 오류 없는 청구로 수익을 극대화하고 감사 리스크를 줄입니다.",
      },
      {
        icon: "ShieldCheck",
        title: "품질 관리 시스템",
        description:
          "서비스 기록 분석, 이용자 만족도, 케어 품질 지표를 실시간 모니터링합니다. 문제가 발생하기 전에 선제적으로 대응할 수 있습니다.",
      },
      {
        icon: "BarChart3",
        title: "경영 데이터 분석",
        description:
          "매출 추이, 인력 효율, 서비스별 수익성을 한눈에 파악하는 대시보드를 제공합니다. 데이터 기반 의사결정으로 기관 경쟁력을 높입니다.",
      },
    ],

    techSpecs: [
      {
        label: "클라우드 인프라",
        value: "AWS 멀티 리전 / 99.99% 가용성 SLA / 자동 스케일링",
      },
      {
        label: "보안 인증",
        value: "ISO 27001 / ISMS-P / 개인정보보호법 완전 준수",
      },
      {
        label: "API 연동",
        value: "국민건강보험공단 EDI / 사회보장정보시스템 / 전자서명 API",
      },
      {
        label: "데이터 백업",
        value: "실시간 데이터 복제 / 일별 스냅샷 / 30일 보관",
      },
    ],

    stats: [
      { value: "40", label: "행정 업무시간 절감", suffix: "%" },
      { value: "99.2", label: "청구 오류 감소", suffix: "%" },
      { value: "18", label: "평균 매출 향상", suffix: "%" },
      { value: "200", label: "도입 예정 기관", suffix: "+" },
    ],

    faqs: [
      {
        question: "기존 시스템에서 DeiCloud로 데이터를 이전할 수 있나요?",
        answer:
          "네, DeiCloud는 주요 기존 케어 관리 시스템의 데이터를 임포트할 수 있는 마이그레이션 도구를 제공합니다. 전담 온보딩 팀이 데이터 이전 전 과정을 지원하며, 서비스 중단 없이 전환할 수 있도록 단계적 마이그레이션을 진행합니다.",
      },
      {
        question: "직원 수가 적은 소규모 기관도 사용할 수 있나요?",
        answer:
          "물론입니다. DeiCloud는 케어 인력 5명의 소규모 기관부터 수백 명 규모의 대형 기관까지 모두 지원합니다. 플랜은 기관 규모에 따라 유연하게 선택할 수 있으며, 초기 도입 비용 부담을 최소화하는 구독형 모델을 제공합니다.",
      },
      {
        question: "출시 일정은 언제인가요?",
        answer:
          "DeiCloud는 현재 개발 마무리 단계로, 2025년 하반기 베타 서비스 출시를 목표로 하고 있습니다. 사전 신청 기관에게는 초기 도입 할인 혜택과 우선 온보딩 지원을 제공할 예정입니다. 지금 바로 사전 신청하세요.",
      },
    ],
  },

  {
    slug: "deiedu",
    nameEn: "DeiEdu",
    nameKo: "교육 플랫폼",
    tagline: "50-Year BAYADA Academy",
    description:
      "50년 BAYADA 노하우를 기반으로 한 교육 플랫폼입니다. 제공자 전문 교육, 이용자·보호자 교육, 인증 교육, 수료증 발급 등의 기능을 제공합니다.",
    icon: "🎓",
    image: "/images/platform/deiedu.jpg",
    href: "/platform/deiedu",
    features: [
      "제공자 전문 교육",
      "이용자·보호자 교육",
      "인증 교육 프로그램",
      "수료증 발급",
      "학습 진도 관리",
      "온라인·오프라인 혼합",
    ],
    ctaLabel: "DeiEdu 바로가기",
    ctaHref: "/platform/deiedu",
    status: "active",

    contentHeadline: "50년 BAYADA 노하우를\n체계적으로 학습하세요",
    contentDescription:
      "DeiEdu는 전 세계 22개국에서 검증된 BAYADA의 케어 교육 커리큘럼을 한국 환경에 맞게 재구성한 헬스케어 전문 교육 플랫폼입니다. 요양보호사 신규 취업부터 경력 전문가의 역량 강화, 보호자 교육까지 모든 케어 관계자를 위한 맞춤 학습 경로를 제공합니다.",
    contentImageUrl: "/images/platform/deiedu-detail.jpg",

    keyFeatures: [
      {
        icon: "PlayCircle",
        title: "고품질 온라인 강좌",
        description:
          "현직 케어 전문가와 BAYADA 글로벌 교육팀이 제작한 실무 중심 강좌 400개 이상을 언제 어디서나 수강하세요. HD 영상과 실습 자료를 제공합니다.",
      },
      {
        icon: "Award",
        title: "국가 인증 연계 프로그램",
        description:
          "요양보호사, 사회복지사, 간호조무사 등 국가 자격증 취득을 위한 체계적 커리큘럼과 실습 시뮬레이션을 제공합니다.",
      },
      {
        icon: "GraduationCap",
        title: "수료증 및 배지 시스템",
        description:
          "과정 수료 시 디지털 수료증과 역량 배지를 발급합니다. BAYADA 공식 인증 수료증은 취업과 경력 개발에 실질적으로 활용됩니다.",
      },
      {
        icon: "MessageSquare",
        title: "전문가 커뮤니티",
        description:
          "케어 전문가, 교육생, BAYADA 멘토가 함께하는 학습 커뮤니티에서 실무 경험을 나누고, 질문하고, 네트워크를 쌓으세요.",
      },
    ],

    useCases: [
      {
        title: "요양보호사 취업 준비생",
        description:
          "자격증 취득부터 현장 실무까지 단계별로 준비하세요. DeiEdu의 요양보호사 양성 과정은 합격률 높은 시험 대비 콘텐츠와 실습 시뮬레이션, BAYADA 취업 연계 서비스를 포함합니다. 수료 후 바로 현장에서 역량을 발휘할 수 있습니다.",
      },
      {
        title: "현직 케어 전문가 역량 강화",
        description:
          "치매, 뇌졸중, 파킨슨병 등 질환별 전문 케어 기술을 심화 학습하세요. 정기적으로 업데이트되는 최신 케어 가이드라인과 글로벌 Best Practice를 통해 전문성을 높이고 커리어를 발전시킬 수 있습니다.",
      },
      {
        title: "가족 보호자 교육",
        description:
          "부모님이나 배우자를 직접 돌보는 가족 보호자를 위한 무료 교육 과정을 제공합니다. 안전한 이동 보조, 식사 도움, 정서적 지지 방법 등 실생활에서 바로 적용할 수 있는 실용적인 케어 기술을 배울 수 있습니다.",
      },
    ],

    stats: [
      { value: "400", label: "교육 과정 수", suffix: "+" },
      { value: "12000", label: "누적 수료자", suffix: "+" },
      { value: "87", label: "취업 연계율", suffix: "%" },
    ],

    faqs: [
      {
        question: "수료증이 공식적으로 인정되나요?",
        answer:
          "DeiEdu 수료증은 BAYADA Korea 공식 발급 수료증으로, 국내 케어 기관 및 BAYADA 파트너 기관에서 인정받습니다. 국가 자격증 연계 과정의 경우 해당 기관의 교육 이수 시간으로 인정받을 수 있으며, 자격별 상세 인정 범위는 과정 소개 페이지에서 확인하실 수 있습니다.",
      },
      {
        question: "모바일에서도 수강할 수 있나요?",
        answer:
          "네, DeiEdu는 모바일 최적화 웹과 iOS/Android 앱을 모두 지원합니다. 동영상 강의는 다운로드하여 오프라인에서도 시청 가능하며, 학습 진도는 디바이스 간에 자동으로 동기화됩니다.",
      },
      {
        question: "기관 단위로 직원 교육을 진행할 수 있나요?",
        answer:
          "물론입니다. DeiEdu 기업 플랜은 기관 관리자가 직원 교육 과정을 일괄 배정하고, 수강 현황과 수료율을 대시보드로 관리할 수 있습니다. 맞춤형 사내 교육 콘텐츠 제작도 지원합니다. 기업 플랜 문의는 고객센터로 연락주세요.",
      },
    ],
  },

  {
    slug: "dtx",
    nameEn: "Dtx",
    nameKo: "디지털 치료제",
    tagline: "Digital Therapeutics",
    description:
      "디지털 치료제 파트너십 서비스입니다. 파트너사와 연계하여 디지털 치료제를 제공하고, 임상 데이터 수집 및 분석을 지원합니다.",
    icon: "💊",
    image: "/images/platform/dtx.jpg",
    href: "/platform/dtx",
    features: [
      "파트너사 연계 디지털 치료제",
      "임상 데이터 수집 및 분석",
      "환자 모니터링",
      "치료 효과 평가",
    ],
    ctaLabel: "파트너십 문의",
    ctaHref: "/contact",
    status: "partnership",

    contentHeadline: "과학적 근거에 기반한\n디지털 건강 관리 솔루션",
    contentDescription:
      "BAYADA의 Dtx 플랫폼은 임상 근거가 검증된 디지털 치료제(DTx) 파트너사와 협력하여 어르신과 만성질환자에게 소프트웨어 기반 치료 솔루션을 제공합니다. 의료 기기로 허가받은 디지털 치료제를 통해 인지 기능 개선, 만성통증 관리, 수면 장애 치료 등을 지원합니다.",
    contentImageUrl: "/images/platform/dtx-detail.jpg",

    keyFeatures: [
      {
        icon: "Brain",
        title: "인지 훈련 프로그램",
        description:
          "경도인지장애 및 치매 예방을 위한 AI 기반 인지 훈련을 제공합니다. 개인 수준에 맞게 난이도가 자동 조정되며, 매일 20분 훈련으로 효과를 확인할 수 있습니다.",
      },
      {
        icon: "Dumbbell",
        title: "처방형 운동 가이드",
        description:
          "낙상 예방, 근력 강화, 관절 건강을 위한 의료진 처방 운동 프로그램입니다. 센서 기반 동작 인식으로 올바른 자세를 가이드하고 운동 효과를 측정합니다.",
      },
      {
        icon: "Pill",
        title: "스마트 복약 관리",
        description:
          "복용 일정 알림, 약물 상호작용 확인, 복약 순응도 리포트를 제공합니다. 여러 질환을 동시에 관리하는 어르신도 안전하게 복약할 수 있도록 지원합니다.",
      },
      {
        icon: "Monitor",
        title: "원격 생체 모니터링",
        description:
          "혈압, 혈당, 심박수 등 주요 생체 데이터를 웨어러블 기기와 연동해 수집하고 분석합니다. 이상 수치 감지 시 케어 팀에 즉시 알림을 전송합니다.",
      },
    ],

    techSpecs: [
      {
        label: "임상 근거",
        value: "파트너사별 RCT 임상시험 완료 / SCI 논문 게재 / 식품의약품안전처 허가",
      },
      {
        label: "규제 승인",
        value: "의료기기 소프트웨어(SaMD) 등급 / 신의료기술평가 진행",
      },
      {
        label: "데이터 보안",
        value: "의료법 준거 암호화 / 익명화 처리 / IRB 승인 임상 데이터 관리",
      },
    ],

    stats: [
      { value: "3", label: "파트너 DTx 기업", suffix: "개" },
      { value: "89", label: "임상 효과 입증률", suffix: "%" },
      { value: "2000", label: "파일럿 참여자", suffix: "+" },
    ],

    faqs: [
      {
        question: "디지털 치료제는 일반 앱과 어떻게 다른가요?",
        answer:
          "디지털 치료제(DTx)는 식품의약품안전처로부터 의료기기 소프트웨어로 정식 허가받은 솔루션입니다. 일반 건강 앱과 달리 임상시험을 통해 치료 효과가 과학적으로 입증되었으며, 의사가 처방하거나 케어 플랜에 포함시킬 수 있습니다.",
      },
      {
        question: "파트너십 연계는 어떻게 진행되나요?",
        answer:
          "DTx 파트너십에 관심 있는 기업 및 의료기관은 문의 페이지를 통해 파트너십 신청을 하실 수 있습니다. 검토 후 담당자가 개별 연락드리며, BAYADA의 케어 네트워크와 데이터 인프라를 활용한 협력 방안을 함께 논의하겠습니다.",
      },
    ],
  },
];

export function getPlatformBySlug(slug: string): PlatformProduct | undefined {
  return platforms.find((p) => p.slug === slug);
}
