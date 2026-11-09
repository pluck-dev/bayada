// 리뷰·피드백 도구 공용 정의 — 서버(API·어드민)와 브라우저(@bayada/review-ui)가 같이 쓴다.
// prisma·node:crypto 를 import 하지 않는 순수 모듈로 유지한다.

export type ReviewSiteKey = "web" | "academy";

type Section = { value: string; label: string };

/** 사이트별 이름과 화면 영역(언어 경로 다음 첫 세그먼트) 이름. 목록에 없는 세그먼트는 그대로 표시한다 */
export const reviewSites: Record<ReviewSiteKey, { label: string; brand: string; sections: readonly Section[] }> = {
  web: {
    label: "웹사이트",
    brand: "BAYADA 웹사이트",
    sections: [
      { value: "home", label: "홈" },
      { value: "about", label: "회사소개" },
      { value: "what-we-do", label: "서비스" },
      { value: "who-we-serve", label: "돌봄 대상" },
      { value: "find-care", label: "돌봄 찾기" },
      { value: "smart-care", label: "스마트 케어" },
      { value: "senior-living", label: "시니어 리빙" },
      { value: "platform", label: "플랫폼" },
      { value: "membership", label: "멤버십" },
      { value: "shop", label: "쇼핑" },
      { value: "guide", label: "이용안내" },
      { value: "how-to-pay", label: "비용 안내" },
      { value: "faq", label: "FAQ" },
      { value: "reviews", label: "고객 후기" },
      { value: "blog", label: "블로그" },
      { value: "resources", label: "자료실" },
      { value: "careers", label: "채용" },
      { value: "employees", label: "임직원" },
      { value: "partnership", label: "파트너십" },
      { value: "providers", label: "제공기관" },
      { value: "contact", label: "상담·문의" },
      { value: "onboarding", label: "온보딩" },
      { value: "my-page", label: "마이페이지" },
      { value: "privacy", label: "개인정보처리방침" },
      { value: "policy", label: "정책" },
      { value: "terms", label: "이용약관" },
    ],
  },
  academy: {
    label: "아카데미",
    brand: "BAYADA 아카데미",
    sections: [
      { value: "home", label: "홈" },
      { value: "courses", label: "프로그램" },
      { value: "pathways", label: "커리어 패스웨이" },
      { value: "certifications", label: "바야다 인증" },
      { value: "credentials", label: "인증 신청" },
      { value: "pass", label: "아카데미 패스" },
      { value: "business", label: "기관 대시보드" },
      { value: "dashboard", label: "마이 러닝" },
      { value: "orders", label: "주문 내역" },
      { value: "checkout", label: "결제" },
      { value: "certificates", label: "수료증" },
      { value: "verify", label: "진위 확인" },
      { value: "invite", label: "초대" },
      { value: "auth", label: "로그인·가입" },
      { value: "terms", label: "이용약관" },
      { value: "privacy", label: "개인정보처리방침" },
      { value: "refund", label: "환불 규정" },
    ],
  },
};

export function isReviewSite(value: unknown): value is ReviewSiteKey {
  return value === "web" || value === "academy";
}

/** 서명된 접근 쿠키 (httpOnly) */
export function reviewCookieName(site: ReviewSiteKey) {
  return `bayada_review_${site}`;
}

/**
 * 브라우저가 읽는 표시용 쿠키. 권한이 아니라 "도구를 불러올지 서버에 물어볼지" 힌트일 뿐이다.
 * 이게 없으면 공개 방문자는 리뷰 도구 JS·CSS 를 받지도, 세션 API 를 부르지도 않는다(웹 정적 페이지 유지).
 */
export function reviewHintCookieName(site: ReviewSiteKey) {
  return `bayada_review_ui_${site}`;
}

const LOCALES = new Set(["ko", "en", "ja", "zh"]);

/** 미리보기(VIEW MODE) iframe 표시용 쿼리. 피드백 페이지 키에는 넣지 않는다 */
export const VIEW_FRAME_PARAM = "__viewframe";

/** 현재 페이지 키 = pathname + search (VIEW MODE 표시 쿼리 제외) */
export function reviewPagePath(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete(VIEW_FRAME_PARAM);
  const rest = params.toString();
  return pathname + (rest ? `?${rest}` : "");
}

/** 화면 영역 = 언어 경로(/ko 등) 다음 첫 세그먼트. 홈은 "home" */
export function pageSection(pagePath: string): string {
  const segments = (pagePath.split(/[?#]/)[0] ?? "").split("/").filter(Boolean);
  if (segments[0] && LOCALES.has(segments[0])) segments.shift();
  const first = (segments[0] ?? "").toLowerCase();
  return first && /^[a-z0-9][a-z0-9-]{0,59}$/.test(first) ? first : "home";
}

export function sectionLabel(site: ReviewSiteKey, section: string): string {
  return reviewSites[site].sections.find((item) => item.value === section)?.label ?? `/${section}`;
}

export function isSectionValue(value: unknown): value is string {
  return typeof value === "string" && (value === "home" || /^[a-z0-9][a-z0-9-]{0,59}$/.test(value));
}

/** 피드백 페이지 키 검증: /로 시작(//는 거부), 2000자 이내, 역슬래시·개행 없음 */
export function isPagePath(value: unknown): value is string {
  return typeof value === "string" && value.length <= 2000 && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value);
}

export type FeedbackKind = "design" | "interaction" | "bug" | "content" | "general";

export const feedbackKinds: Array<{ value: FeedbackKind; label: string }> = [
  { value: "design", label: "디자인 수정" },
  { value: "interaction", label: "인터랙션 요청" },
  { value: "bug", label: "버그·오류" },
  { value: "content", label: "콘텐츠 피드백" },
  { value: "general", label: "일반 의견" },
];

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return feedbackKinds.some((kind) => kind.value === value);
}

export function feedbackKindLabel(value: string): string {
  return feedbackKinds.find((kind) => kind.value === value)?.label ?? "일반 의견";
}

export const feedbackStatuses = {
  open: "미처리",
  discussion: "협의",
  developed: "개발완료",
  deployed: "배포완료",
  resolved: "디자인 확인완료",
} as const;
export type FeedbackStatus = keyof typeof feedbackStatuses;
export const feedbackStatusKeys = Object.keys(feedbackStatuses) as FeedbackStatus[];

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return typeof value === "string" && Object.hasOwn(feedbackStatuses, value);
}

/** 사이트 도구에서 직접 바꿀 수 있는 상태 전환. 배포완료는 어드민에서만 기록한다 (원본: 배포 검증 후 기록) */
export const manualFeedbackTransitions: Record<FeedbackStatus, FeedbackStatus[]> = {
  open: ["discussion", "developed"],
  discussion: ["open", "developed"],
  developed: ["open"],
  deployed: ["open", "discussion", "resolved"],
  resolved: ["open"],
};

/** 작성자 소속. 원본 도구의 부서(NEXT/FN12) 자리 — 고객사와 제작팀 둘로 나눈다 */
export const feedbackDepartments = [
  { value: "client", label: "바야다" },
  { value: "agency", label: "제작팀" },
] as const;
export type FeedbackDepartment = (typeof feedbackDepartments)[number]["value"];

export function isFeedbackDepartment(value: unknown): value is FeedbackDepartment {
  return value === "client" || value === "agency";
}

/** 소속 표시 이름 (어드민 댓글은 admin) */
export function departmentLabel(value: string | null | undefined): string {
  if (value === "admin") return "관리자";
  return feedbackDepartments.find((item) => item.value === value)?.label ?? "";
}

export const REVIEWER_NAME_MAX = 30;

/** 작성자 이름: 앞뒤 공백 없이 1~30자, 제어 문자 없음 */
export function isReviewerName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= REVIEWER_NAME_MAX &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

export const FEEDBACK_BODY_MAX = 3000;
export const FEEDBACK_TAG_MAX = 5;
export const FEEDBACK_TAG_LENGTH = 24;
export const FEEDBACK_LIST_PAGE_SIZE = 30;
export const FEEDBACK_MARKER_PAGE_SIZE = 100;
export const FEEDBACK_REPLY_LIMIT = 500;

export function isFeedbackTags(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= FEEDBACK_TAG_MAX &&
    value.every((tag) => typeof tag === "string" && tag.trim() !== "" && tag === tag.trim() && tag.length <= FEEDBACK_TAG_LENGTH) &&
    new Set(value).size === value.length
  );
}

/** 공유 링크 해시: #feedback=<selector>&text=<발췌>&review=<id>[&scope=…] */
export function feedbackHash(context: { selector?: unknown; text?: unknown }, id: number, extra?: Record<string, string>): string {
  return new URLSearchParams({
    feedback: String(context.selector ?? ""),
    text: String(context.text ?? ""),
    review: String(id),
    ...extra,
  }).toString();
}
