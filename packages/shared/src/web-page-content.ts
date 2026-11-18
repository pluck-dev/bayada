import { WEB_CAREERS_DEFAULTS, WEB_RESOURCES_DEFAULTS } from "./web-operational-content";
import { WEB_AUDIENCE_DEFAULTS } from "./web-audience-content";
export { providerSegments, userSegments } from "./web-audience-content";
export type { AudienceSegment } from "./web-audience-content";
import { WEB_PAYMENT_DEFAULTS } from "./web-payment-content";
import { WEB_HOME_DEFAULTS } from "./web-home-content";
import enrichedContent from "../../../data/_enriched-content.json";

const brandColors = [
    { name: "BAYADA Red", hex: "#CE0E2D", desc: "주요 브랜드 컬러" },
    { name: "Dark Navy", hex: "#1B2A4A", desc: "텍스트·배경" },
    { name: "White", hex: "#FFFFFF", desc: "배경·대비" },
    { name: "Warm Gray", hex: "#F5F5F0", desc: "서피스·보조" },
  ];

const orgChart = {
    governance: "DEILEA.AI Governance",
    layers: [
      { name: "Global Core", desc: "글로벌 전략 수립" },
      { name: "JAPAC Regional", desc: "아시아태평양 지역 총괄" },
      { name: "Country Squads", desc: "한국 현지 운영" },
    ],
    xTeams: [
      { name: "Product x AI", desc: "DeiBud, Dtx 등 AI 제품" },
      { name: "Digital Platform x IT", desc: "DeiCloud, DeiEdu 플랫폼" },
      { name: "Compliance x Public Sector", desc: "규제·공공 대응" },
      { name: "GTM x Partnerships", desc: "시장 진출·파트너십" },
    ],
  };

const certifications = [
    {
      title: "노인장기요양보험 지정기관",
      desc: "국민건강보험공단 공식 지정 방문요양·방문간호 서비스 제공기관",
      year: "2024",
    },
    {
      title: "2025 엑설런스 인 헬스케어 어워드",
      desc: "홈헬스케어 분야 우수 서비스 품질 인정",
      year: "2025",
    },
    {
      title: "BAYADA 글로벌 인증",
      desc: "BAYADA International Quality Standards 충족",
      year: "2024",
    },
    {
      title: "ISO 9001 품질경영시스템",
      desc: "국제 품질경영 표준 인증 획득",
      year: "2024",
    },
  ];

const sections = [
  {
    id: "article-1",
    title: "제1조 (목적)",
    content: [
      "이 약관은 바야다홈헬스케어(이하 \"회사\")가 운영하는 웹사이트 및 관련 서비스(이하 \"서비스\")를 이용함에 있어 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
    ],
  },
  {
    id: "article-2",
    title: "제2조 (정의)",
    content: [
      "이 약관에서 사용하는 용어의 정의는 다음과 같습니다.",
      "① \"서비스\"란 회사가 제공하는 홈헬스케어 정보 제공, 상담 신청, 교육 콘텐츠 등 일체의 온라인 서비스를 의미합니다.",
      "② \"이용자\"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.",
      "③ \"회원\"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 이용할 수 있는 자를 의미합니다.",
      "④ \"비회원\"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.",
    ],
  },
  {
    id: "article-3",
    title: "제3조 (약관의 효력 및 변경)",
    content: [
      "① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.",
      "② 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.",
      "③ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우 약관의 변경 사항에 동의한 것으로 간주합니다.",
    ],
  },
  {
    id: "article-4",
    title: "제4조 (서비스의 제공)",
    content: [
      "① 회사는 다음과 같은 서비스를 제공합니다.",
      "   1. 홈헬스케어 서비스 정보 제공",
      "   2. 서비스 상담 신청 및 연결",
      "   3. 건강 관련 교육 콘텐츠 및 강의 제공",
      "   4. 시니어 케어 관련 커뮤니티 및 정보 서비스",
      "   5. 기타 회사가 추가 개발하거나 제휴를 통해 이용자에게 제공하는 서비스",
      "② 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 일시적으로 서비스가 중단될 수 있습니다.",
    ],
  },
  {
    id: "article-5",
    title: "제5조 (회원가입 및 관리)",
    content: [
      "① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.",
      "② 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 거부할 수 있습니다.",
      "   1. 실명이 아니거나 타인의 정보를 이용한 경우",
      "   2. 허위 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우",
      "   3. 이전에 약관 위반으로 자격을 상실한 경우",
      "③ 회원은 등록 사항에 변경이 있는 경우, 즉시 온라인으로 수정하거나 전자우편을 통해 회사에 변경사항을 통보해야 합니다.",
    ],
  },
  {
    id: "article-6",
    title: "제6조 (개인정보 보호)",
    content: [
      "① 회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다.",
      "② 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우 및 서비스 제공을 위해 필요한 최소한의 범위 내에서 업무 위탁 시에는 예외로 합니다.",
      "③ 개인정보의 수집·이용 목적, 수집 항목, 보유·이용 기간 등 상세한 내용은 개인정보처리방침을 통해 확인할 수 있습니다.",
    ],
  },
  {
    id: "article-7",
    title: "제7조 (회원의 의무)",
    content: [
      "① 이용자는 다음 행위를 하여서는 안 됩니다.",
      "   1. 신청 또는 변경 시 허위 내용의 등록",
      "   2. 타인의 정보 도용",
      "   3. 회사가 게시한 정보의 변경",
      "   4. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시",
      "   5. 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해",
      "   6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위",
      "   7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위",
    ],
  },
  {
    id: "article-8",
    title: "제8조 (서비스 이용 제한)",
    content: [
      "① 회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.",
      "② 회사는 전항에도 불구하고, 개인정보 도용 및 결제사기, 불법프로그램의 제공 및 운영, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」을 위반한 불법통신 및 해킹 등의 경우 즉시 영구이용정지를 할 수 있습니다.",
    ],
  },
  {
    id: "article-9",
    title: "제9조 (책임 제한)",
    content: [
      "① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.",
      "② 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.",
      "③ 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.",
    ],
  },
  {
    id: "article-10",
    title: "제10조 (분쟁 해결)",
    content: [
      "① 회사는 이용자로부터 제출되는 불만사항 및 의견을 우선적으로 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보합니다.",
      "② 이 약관에 관한 분쟁은 대한민국 법령에 의하고, 분쟁에 관한 소송은 회사의 본사 소재지 관할 법원에 제기합니다.",
      "③ 기타 이 약관에서 정하지 않은 사항은 관계 법령 및 상관습에 따릅니다.",
    ],
  },
];

const policyCategories = [
  {
    title: "서비스 품질 정책",
    icon: "★",
    items: [
      "케어 품질 기준: BAYADA 글로벌 표준에 부합하는 방문간호·돌봄 서비스 품질 기준을 수립하고 준수합니다.",
      "서비스 모니터링: 정기적인 서비스 점검 및 이용자 만족도 조사를 통해 서비스 품질을 지속적으로 개선합니다.",
      "피드백 체계: 이용자·보호자의 의견을 적극 수렴하여 서비스 개선에 반영하는 체계를 운영합니다.",
      "품질 인증: 국내·외 관련 인증 기준에 따라 정기적인 품질 감사 및 인증 갱신을 실시합니다.",
    ],
  },
  {
    title: "안전 관리 정책",
    icon: "◉",
    items: [
      "감염 관리: 표준주의 지침 및 감염병 예방 수칙을 준수하여 이용자와 직원 모두를 보호합니다.",
      "응급 상황 대응: 응급 상황 발생 시 신속한 초기 대응 및 전문 의료기관 연계 절차를 운영합니다.",
      "사고 보고 체계: 모든 사고·near-miss 사례를 보고·분석하여 재발 방지 대책을 마련합니다.",
      "안전 교육: 전 직원을 대상으로 정기적인 안전 교육 및 훈련을 실시합니다.",
    ],
  },
  {
    title: "인력 관리 정책",
    icon: "▲",
    items: [
      "채용 기준: 자격증 보유, 경력, 신원조회 등 엄격한 채용 기준을 적용하여 우수 인력을 선발합니다.",
      "교육 요건: 신규 직원 오리엔테이션 및 직무별 정기 교육을 통해 전문성을 강화합니다.",
      "역량 평가: 연 1회 이상 역량 평가를 실시하고 결과에 따라 맞춤형 개발 계획을 수립합니다.",
      "처우 보장: 공정한 보상 체계와 복리후생 제도를 운영하여 직원 만족도를 높입니다.",
    ],
  },
  {
    title: "윤리 및 규정 준수",
    icon: "◆",
    items: [
      "윤리 강령: 이용자 존중, 공정성, 투명성을 핵심 가치로 하는 윤리 강령을 제정하고 준수합니다.",
      "법규 준수: 노인장기요양보험법, 의료법 등 관련 법규를 철저히 준수합니다.",
      "내부 신고 제도: 비위 행위 및 법규 위반을 익명으로 신고할 수 있는 내부 채널을 운영합니다.",
      "이해충돌 방지: 직원의 이해충돌 가능성을 사전에 예방하고 관리하는 절차를 운영합니다.",
    ],
  },
  {
    title: "정보 보안 정책",
    icon: "■",
    items: [
      "개인정보 처리: 「개인정보 보호법」에 따라 이용자 개인정보를 안전하게 수집·처리·보관합니다.",
      "의료정보 관리: 민감한 건강·의료 정보는 별도의 강화된 보안 체계를 적용하여 관리합니다.",
      "시스템 보안: 정기적인 취약점 점검 및 보안 패치를 통해 IT 시스템을 안전하게 유지합니다.",
      "데이터 파기: 보존 기간이 만료된 개인정보는 복구 불가능한 방법으로 안전하게 파기합니다.",
    ],
  },
  {
    title: "고객 권리 보장",
    icon: "●",
    items: [
      "고객 권리 헌장: 이용자의 알 권리, 선택권, 비밀보장, 안전한 서비스를 받을 권리 등을 명문화합니다.",
      "불만 처리 절차: 이용자 불만 접수 후 3일 이내 초기 응대, 7일 이내 처리 결과를 안내합니다.",
      "서비스 보증: 서비스 품질 기준에 미달하는 경우 재서비스 제공 또는 합리적인 보상을 실시합니다.",
      "옹호 지원: 이용자가 권리를 주장하기 어려운 경우 옹호자 연계 서비스를 지원합니다.",
    ],
  },
];

const { url: aboutUrl, ...intro } = enrichedContent.pages.aboutus;
const { url: guideUrl, ...guide } = enrichedContent.pages["usage-guide"];
const { url: privacyUrl, ...privacy } = enrichedContent.pages["privacy-policy"];
export const WEB_PAGE_DEFAULTS = { careers: WEB_CAREERS_DEFAULTS, resources: WEB_RESOURCES_DEFAULTS, ...WEB_AUDIENCE_DEFAULTS, payment: WEB_PAYMENT_DEFAULTS, home: WEB_HOME_DEFAULTS, about: { intro, brandColors, orgChart, certifications }, guide, privacy, terms: { sections }, policy: { categories: policyCategories } };

export type WebPageKey = keyof typeof WEB_PAGE_DEFAULTS;
export const WEB_PAGE_TITLES: Record<WebPageKey, string> = { careers: "채용 공고", resources: "자료실", audienceHealthcare: "의료인", audienceOther: "비의료인", audienceHospitals: "병원", audienceClinics: "의원", audienceLtci: "요양기관", audienceNursing: "방문간호기관", audienceGovernment: "지자체", audienceSenior: "시니어", payment: "비용 안내", home: "메인 화면", about: "회사소개", guide: "이용안내", privacy: "개인정보처리방침", terms: "이용약관", policy: "정책과 절차" };
export const WEB_PAGE_PREFIX = "web-page/";
export const isWebPageKey = (value: unknown): value is WebPageKey => typeof value === "string" && Object.hasOwn(WEB_PAGE_DEFAULTS, value);

export function parseWebPageContent<K extends WebPageKey>(key: K, input: unknown): typeof WEB_PAGE_DEFAULTS[K] {
  if (JSON.stringify(input)?.length > 200000) throw new Error("본문은 200,000자 이내로 입력하세요.");
  const parse = (template: unknown, value: unknown, path: string): unknown => {
    if (typeof template === "string") {
      if (key.startsWith("audience") && /\.(slug|type|href|ctaHref)$/.test(path)) return template;
      if (typeof value !== "string" || value.length > 20000) throw new Error(`${path}: 문자열 길이와 형식을 확인하세요.`);
      if (key === "resources" && path.endsWith(".href") && value !== "" && value !== "#" && !/^(?:\/(?!\/)[^\\\s]*|https:\/\/[^\s]+)$/.test(value)) throw new Error("자료 URL은 사이트 내부 경로나 HTTPS 주소로 입력하세요.");
      if (key === "careers" && path.endsWith(".deadline") && value !== "" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new Error("마감일은 YYYY-MM-DD 형식으로 입력하세요.");
      if (key === "payment" && /\.(color|bg)$/.test(path) && !/^#[0-9a-f]{6}$/i.test(value)) throw new Error("색상은 #000000 형식으로 입력하세요.");
      if (key === "payment" && path.endsWith(".icon") && !["Shield", "HeartPulse", "FileText", "Phone", "ClipboardList", "Home", "HeartHandshake", "Star", "AlertCircle"].includes(value)) throw new Error("지원하는 아이콘 이름을 입력하세요.");
      if (path.endsWith(".hex") && !/^#[0-9a-f]{6}$/i.test(value)) throw new Error("색상은 #000000 형식으로 입력하세요.");
      if (((key === "home" && /\.(icon|src)$/.test(path)) || (key.startsWith("audience") && /\.(image|heroImageUrl|contentImageUrl)$/.test(path))) && !/^\/(?!\/)[^\\\s]+$/.test(value)) throw new Error(`${path}: 사이트 내부 이미지 경로를 입력하세요.`);
      return value;
    }
    if (typeof template === "boolean") { if (typeof value !== "boolean") throw new Error(`${path}: 선택 값을 확인하세요.`); return value; }
    if (typeof template === "number") { if (typeof value !== "number" || !Number.isFinite(value) || (key === "home" && (value < 0 || value > 1000000000))) throw new Error(`${path}: 숫자를 입력하세요.`); return value; }
    if (Array.isArray(template)) {
      if (!Array.isArray(value) || value.length > 100) throw new Error(`${path}: 목록은 100개 이내로 입력하세요.`);
      return value.map((entry, i) => {
        const result = parse(template[0] ?? "", entry, `${path}.${i}`);
        if (result && typeof result === "object" && !Array.isArray(result)) {
          if ("step" in result) (result as Record<string, unknown>).step = i + 1;
          if ("id" in result) (result as Record<string, unknown>).id = `section-${i + 1}`;
        }
        return result;
      });
    }
    if (template && typeof template === "object") {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path}: 항목 형식을 확인하세요.`);
      return Object.fromEntries(Object.entries(template).map(([field, expected]) => [field, parse(expected, (value as Record<string, unknown>)[field], `${path}.${field}`)]));
    }
    throw new Error(`${path}: 지원하지 않는 내용입니다.`);
  };
  return parse(WEB_PAGE_DEFAULTS[key], input, key) as typeof WEB_PAGE_DEFAULTS[K];
}
