const paymentOptions = [
  {
    icon: "Shield",
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "노인장기요양보험",
    description:
      "65세 이상 또는 노인성 질환을 가진 분이 장기요양등급 판정을 받으면 이용 가능합니다.",
    details: [
      { label: "본인부담금", value: "재가급여 15%, 시설급여 20%" },
      { label: "감면혜택", value: "기초생활수급자, 차상위계층 감면" },
    ],
  },
  {
    icon: "HeartPulse",
    color: "#2563eb",
    bg: "#dbeafe",
    title: "국민건강보험",
    description:
      "의사 처방에 따른 가정간호 서비스는 국민건강보험이 적용됩니다.",
    details: [
      { label: "적용범위", value: "방문간호, 방문재활 등 의료 서비스" },
      { label: "본인부담금", value: "총 비용의 10~20%" },
    ],
  },
  {
    icon: "FileText",
    color: "#16a34a",
    bg: "#dcfce7",
    title: "실비보험 / 민간보험",
    description:
      "가입하신 실비보험 및 민간 의료보험으로 일부 비용을 보장받으실 수 있습니다.",
    details: [
      { label: "확인사항", value: "보험사에 가정간호 보장 여부 확인 필요" },
      { label: "제출서류", value: "진단서, 처방전, 영수증" },
    ],
  },
];

const steps = [
  {
    icon: "Phone",
    color: "#ce0e2d",
    title: "상담 신청",
    description: "전화 또는 온라인으로 무료 상담을 신청하세요",
  },
  {
    icon: "ClipboardList",
    color: "#2563eb",
    title: "자격 확인",
    description: "보험 자격 및 지원 제도 해당 여부를 확인합니다",
  },
  {
    icon: "Home",
    color: "#16a34a",
    title: "방문 평가",
    description: "전문 간호사가 가정을 방문하여 필요한 서비스를 평가합니다",
  },
  {
    icon: "HeartHandshake",
    color: "#d97706",
    title: "케어 플랜 수립",
    description: "맞춤형 케어 플랜을 수립하고 비용을 안내합니다",
  },
  {
    icon: "Star",
    color: "#7c3aed",
    title: "서비스 시작",
    description: "담당 전문가가 배정되어 서비스가 시작됩니다",
  },
];

const supportPrograms = [
  {
    icon: "AlertCircle",
    color: "#ce0e2d",
    bg: "#fae6ea",
    title: "긴급 돌봄 지원",
    description: "갑작스러운 상황에서 긴급하게 돌봄이 필요한 경우 지원",
  },
  {
    icon: "Shield",
    color: "#2563eb",
    bg: "#dbeafe",
    title: "저소득 가구 지원",
    description: "소득 기준에 따른 본인부담금 감면 프로그램",
  },
  {
    icon: "HeartPulse",
    color: "#16a34a",
    bg: "#dcfce7",
    title: "제약사 협력 프로그램",
    description: "특정 질환 환자를 위한 무상 지원 프로그램",
  },
];

const faqs = [
  {
    q: "장기요양등급은 어떻게 신청하나요?",
    a: "국민건강보험공단(1577-1000)에 신청하거나 가까운 공단 지사를 방문하시면 됩니다. 신청 후 공단 직원이 가정을 방문하여 기능 상태를 조사하고, 등급판정위원회에서 최종 등급을 결정합니다. 바야다 상담팀에서도 신청 절차를 안내해 드립니다.",
  },
  {
    q: "서비스 비용은 대략 얼마인가요?",
    a: "서비스 종류, 이용 시간, 적용 보험에 따라 비용이 다릅니다. 노인장기요양보험 적용 시 본인부담금은 재가급여의 경우 15% 수준이며, 월 이용 한도 내에서 이용하실 수 있습니다. 정확한 비용은 무료 상담을 통해 안내해 드립니다.",
  },
  {
    q: "보험 적용이 안 되는 서비스도 있나요?",
    a: "네, 일부 서비스는 보험 적용이 되지 않아 전액 본인 부담으로 이용하셔야 합니다. 가사 지원, 동행 서비스, 정서 지원 등 일부 항목이 해당될 수 있습니다. 상담 시 보험 적용 여부와 비급여 항목에 대해 상세히 안내해 드립니다.",
  },
  {
    q: "분할 납부가 가능한가요?",
    a: "서비스 유형과 계약 조건에 따라 분할 납부 방식을 협의할 수 있습니다. 경제적 어려움이 있으신 경우 상담 시 말씀해 주시면 가능한 지원 방법을 함께 찾아드립니다.",
  },
];

export const WEB_PAYMENT_DEFAULTS = { paymentOptions, steps, supportPrograms, faqs };
