import type { Review } from "@/types";

// Placeholder 리뷰 데이터 (FR-W-017)
export const reviews: Review[] = [
  {
    id: "rv-001",
    rating: 5,
    content:
      "어머니의 방문간호 서비스를 이용하고 있습니다. 전문 간호사분이 정말 친절하시고, 매번 꼼꼼하게 건강 상태를 체크해 주셔서 안심이 됩니다.",
    author: "70대 여성 보호자",
    serviceType: "skilled-nursing",
    createdAt: "2026-01-10",
  },
  {
    id: "rv-002",
    rating: 5,
    content:
      "퇴원 후 전환의료 프로그램을 통해 가정에서 회복할 수 있었습니다. 병원과 가정 간의 연속적인 케어가 정말 큰 도움이 되었습니다.",
    author: "60대 남성 본인",
    serviceType: "transitional-care",
    createdAt: "2026-01-08",
  },
  {
    id: "rv-003",
    rating: 4,
    content:
      "아버지의 치매 돌봄을 위해 방문요양 서비스를 이용하고 있습니다. 요양보호사분이 아버지를 정말 잘 이해해주시고, 가족인 저도 많이 의지하고 있습니다.",
    author: "80대 남성 보호자",
    serviceType: "private-assistive-care",
    createdAt: "2025-12-28",
  },
  {
    id: "rv-004",
    rating: 5,
    content:
      "맞춤 운동 프로그램을 통해 무릎 수술 후 재활이 많이 좋아졌습니다. 트레이너분이 제 상태에 맞게 운동 강도를 조절해 주셔서 좋았습니다.",
    author: "70대 여성 본인",
    serviceType: "physical-trainer",
    createdAt: "2025-12-20",
  },
  {
    id: "rv-005",
    rating: 5,
    content:
      "당뇨병 관리를 위한 환자지원프로그램에 참여하고 있습니다. 복약 관리부터 식이요법까지 체계적으로 관리해 주셔서 혈당 수치가 많이 안정되었습니다.",
    author: "60대 남성 본인",
    serviceType: "patient-support",
    createdAt: "2025-12-15",
  },
  {
    id: "rv-006",
    rating: 4,
    content:
      "장기요양 서비스를 이용하면서 어머니의 일상생활이 훨씬 편안해졌습니다. 정기적인 품질 관리도 이루어져서 서비스에 대한 신뢰가 있습니다.",
    author: "80대 여성 보호자",
    serviceType: "long-term-care",
    createdAt: "2025-12-10",
  },
  {
    id: "rv-007",
    rating: 5,
    content:
      "BAYADA 아카데미에서 요양보호사 교육을 수료했습니다. 50년 노하우가 담긴 교육이 정말 체계적이고 실무에 도움이 됩니다.",
    author: "40대 여성 제공자",
    serviceType: "education",
    createdAt: "2025-12-05",
  },
  {
    id: "rv-008",
    rating: 5,
    content:
      "호스피스 서비스를 통해 아버지의 마지막 시간을 가정에서 편안하게 보낼 수 있었습니다. 의료진의 따뜻한 돌봄에 진심으로 감사합니다.",
    author: "70대 남성 보호자",
    serviceType: "hospice",
    createdAt: "2025-11-28",
  },
  {
    id: "rv-009",
    rating: 4,
    content:
      "DeiBud AI 상담을 통해 필요한 서비스 정보를 빠르게 얻을 수 있었습니다. 24시간 이용 가능하고 한국어로 상담할 수 있어서 편리합니다.",
    author: "50대 여성 보호자",
    serviceType: "skilled-nursing",
    createdAt: "2025-11-20",
  },
  {
    id: "rv-010",
    rating: 5,
    content:
      "방문간호센터 파트너십을 통해 저희 기관의 서비스 품질이 크게 향상되었습니다. 운영 컨설팅과 교육 프로그램이 매우 실용적입니다.",
    author: "간호센터 대표",
    serviceType: "education",
    createdAt: "2025-11-15",
  },
  {
    id: "rv-011",
    rating: 5,
    content:
      "시니어 리빙 솔루션으로 부모님 댁의 안전 환경을 개선했습니다. 스마트 홈 연동과 안전 설비가 정말 큰 안심이 됩니다.",
    author: "70대 부부 보호자",
    serviceType: "senior-living",
    createdAt: "2025-11-10",
  },
  {
    id: "rv-012",
    rating: 4,
    content:
      "분산형 임상시험에 참여하며 가정에서 편하게 임상 절차를 진행할 수 있었습니다. 방문해주시는 간호사분이 매우 전문적이었습니다.",
    author: "50대 여성 본인",
    serviceType: "dct",
    createdAt: "2025-11-05",
  },
];

export function getAverageRating(): number {
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getReviewsByService(serviceType: string): Review[] {
  return reviews.filter((r) => r.serviceType === serviceType);
}
