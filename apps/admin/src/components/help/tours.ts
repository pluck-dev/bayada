/**
 * 화면 둘러보기(코치 마크) 원본 — 순수 데이터. 대상 요소는 화면에 `data-tour="이름"` 으로 표시한다.
 * - target 이 없으면 화면 가운데 카드. "a|b" 는 둘 중 화면에 보이는 쪽(사이드바 버튼 | 좁은 화면 상단 바 버튼).
 * - 권한·상태 때문에 대상이 안 그려진 단계는 시작할 때 건너뛴다(예: 회원 관리 권한이 없으면 일괄 승인 단계 없음).
 * - 새 화면에 둘러보기를 붙이려면 여기 TourDef 를 추가하고(match = 언어 경로를 뺀 경로), 화면에 data-tour 를 단다.
 */
export type TourStep = { target?: string; title: string; body: string };
export type TourDef = { id: string; title: string; match?: RegExp; steps: TourStep[] };

export const WELCOME_TOUR = "welcome";
export const SIDEBAR_TOUR = "sidebar";

const SIDEBAR_STEPS: TourStep[] = [
  {
    target: "side-workspace",
    title: "관리할 사이트 전환",
    body: "아카데미(교육 플랫폼)와 웹사이트(홈페이지)를 여기서 바꿔요. 바꾸면 아래 메뉴가 그 사이트 메뉴로 바뀌어요. 한쪽 권한만 있으면 이 전환은 보이지 않아요.",
  },
  {
    target: "side-nav",
    title: "메뉴",
    body: "내 역할에 주어진 권한의 메뉴만 보여요. 빨간 숫자는 지금 처리할 일(승인 대기·가입 승인·신고 후기·신규 문의 등)이에요.",
  },
  {
    target: "side-collapse",
    title: "사이드바 접기",
    body: "누르면 아이콘만 남은 좁은 메뉴로 접혀 화면을 넓게 쓸 수 있어요. 아이콘에 마우스를 올리면 메뉴 이름이 보여요. 키보드 Ctrl+B(맥은 ⌘+B)로도 접고 펼 수 있고, 다음에 들어와도 그대로 기억해요.",
  },
  {
    target: "side-help|topbar-help",
    title: "도움말",
    body: "어느 화면에서든 여기를 누르면 그 화면에서 하는 일을 알려 주고, '이 화면 둘러보기'로 지금 같은 안내를 다시 볼 수 있어요.",
  },
];

export const TOURS: TourDef[] = [
  {
    id: WELCOME_TOUR,
    title: "처음 안내",
    steps: [
      {
        title: "BAYADA 관리자에 오신 걸 환영해요",
        body: "1분 동안 화면 구성을 같이 볼게요. 언제든 '건너뛰기'(Esc)를 눌러도 되고, 도움말이나 운영 매뉴얼에서 다시 볼 수 있어요.",
      },
      {
        target: "topbar-menu",
        title: "메뉴 열기",
        body: "좁은 화면에서는 메뉴가 숨어 있어요. 왼쪽 위 버튼을 누르면 메뉴가 열리고, 메뉴를 고르거나 바깥을 누르면 닫혀요.",
      },
      ...SIDEBAR_STEPS,
      {
        target: "side-user",
        title: "내 계정과 역할",
        body: "이름 아래가 내 역할이에요. 권한 밖의 작업은 서버가 거절하니 안심하고 둘러보세요. 역할을 바꿔야 하면 역할·권한을 관리하는 관리자에게 요청하세요.",
      },
      {
        title: "준비 끝!",
        body: "각 화면에서 도움말 → '이 화면 둘러보기'를 누르면 그 화면 사용법을 같은 방식으로 안내해요. 전체 업무 흐름은 도움말 아래 '운영 매뉴얼'에 있어요.",
      },
    ],
  },
  { id: SIDEBAR_TOUR, title: "사이드바", steps: SIDEBAR_STEPS },
  {
    id: "dashboard",
    title: "대시보드",
    match: /^$/,
    steps: [
      { target: "page-header", title: "대시보드", body: "아카데미 운영 현황을 한눈에 보는 첫 화면이에요." },
      { target: "dash-kpi", title: "핵심 숫자", body: "승인 대기 프로그램과 이번 달 신규 수강·수료·수료증 발급 수예요." },
      { target: "dash-status", title: "프로그램 상태", body: "작성 중부터 게시·보관까지 상태별 프로그램 수예요. 게시 중인 프로그램의 사내·외부 공개 비율도 보여요." },
      { target: "dash-todo", title: "처리 대기", body: "내 권한으로 처리할 일만 모았어요. 항목을 누르면 해당 목록이 바로 열려요. 아침마다 여기 숫자를 0 으로 만드는 게 하루 업무의 시작이에요." },
      { target: "dash-activity", title: "최근 활동", body: "누가 무엇을 바꿨는지 최근 기록이에요. 전체 기록은 감사 로그에서 봐요." },
    ],
  },
  {
    id: "programs",
    title: "프로그램 목록",
    match: /^\/programs$/,
    steps: [
      { target: "page-header", title: "프로그램", body: "아카데미의 모든 교육 프로그램이에요. 프로그램명을 누르면 편집 화면이 열려요." },
      { target: "page-actions", title: "새 프로그램", body: "작성 중 상태로 새 프로그램을 만들어요. 기본 정보를 넣고 커리큘럼을 채운 뒤 승인 요청해요." },
      { target: "program-filters", title: "검색·필터", body: "프로그램명·slug 로 찾고, 공개범위(사내·외부)와 상태로 걸러요." },
      { target: "program-table", title: "목록과 일괄 전환", body: "행을 체크하면 위에 막대가 나타나 여러 프로그램을 한 번에 외부 공개·사내 전용으로 바꿀 수 있어요." },
    ],
  },
  {
    id: "program-new",
    title: "새 프로그램 작성",
    match: /^\/(programs|partner-console\/programs)\/new$/,
    steps: [
      { target: "page-header", title: "새 프로그램", body: "작성 중(draft) 상태로 만들어져요. 이 단계에서는 학습자에게 보이지 않아요." },
      { target: "program-form-basic", title: "기본 정보", body: "프로그램명과 slug(주소)는 필수예요. slug 는 영문·숫자·하이픈으로 짧게 써요." },
      { target: "program-form-cover", title: "표지", body: "기본은 ‘자동 생성’ — 제목·카테고리로 아카데미 카드 표지를 그려요. 직접 만든 16:9 이미지가 있으면 ‘업로드 이미지’로 바꾸고 URL 을 넣어요." },
      { target: "program-form-meta", title: "분류·대상", body: "제공기관·소요시간·대상 직군은 승인 요청 전에 반드시 채워야 하는 필수 항목이에요." },
      { target: "program-form-goals", title: "학습목표", body: "1개 이상 있어야 승인 요청할 수 있어요." },
      { target: "program-form-save", title: "만들고 커리큘럼 편집", body: "저장하면 커리큘럼 탭으로 이동해요. 섹션과 레슨(영상·텍스트·퀴즈)을 1개 이상 넣어야 승인 요청할 수 있어요." },
    ],
  },
  {
    id: "program-detail",
    title: "프로그램 편집",
    match: /^\/(programs|partner-console\/programs)\/(?!new$)[^/]+$/,
    steps: [
      { target: "page-header", title: "프로그램 편집", body: "위에 지금 상태가 보여요. 승인 요청·검토 중·승인 상태에서는 편집이 잠겨요." },
      { target: "program-tabs", title: "탭", body: "기본정보(노출 설정 포함) · 커리큘럼 · 상태·이력으로 나뉘어 있어요." },
      { target: "program-checklist", title: "필수 항목 체크", body: "학습목표·대상 직군·소요시간·커리큘럼·제공기관이 모두 채워져야 승인 요청 버튼이 켜져요." },
      { target: "program-workflow", title: "워크플로우", body: "승인 요청·재제출과, 권한이 있으면 검토 시작·승인·수정 요청·게시·보관 버튼이 여기 있어요. 수정 요청은 검토 의견(사유)이 필수예요." },
    ],
  },
  {
    id: "approvals",
    title: "승인 대기",
    match: /^\/approvals$/,
    steps: [
      { target: "page-header", title: "승인 대기", body: "승인 요청 → 형식·품질 검토 → (임상 검토) → 승인 → 게시 순서로 진행돼요. 오래 기다린 순서로 정렬돼요." },
      { target: "approval-filters", title: "단계별 보기", body: "단계(승인 요청·형식·품질 검토·임상 검토·승인)로 걸러요. 임상 리뷰어는 임상 검토 항목만 보여요." },
      { target: "approval-table", title: "검토하기", body: "행 끝 '검토 →'를 누르면 필수 필드·요약·커리큘럼·이력을 한 화면에서 보고 처리할 수 있어요." },
    ],
  },
  {
    id: "approval-detail",
    title: "프로그램 검토",
    match: /^\/approvals\/[^/]+$/,
    steps: [
      { target: "page-header", title: "검토 화면", body: "'프로그램 편집 화면 열기'로 원본을 볼 수 있어요. 검토 중에는 작성자가 고칠 수 없어요." },
      { target: "approval-content", title: "검토할 내용", body: "필수 필드 체크, 프로그램 요약, 커리큘럼·레슨, 지금까지의 이력을 위에서부터 확인해요." },
      { target: "program-workflow", title: "처리", body: "검토 의견을 쓰고 단계 버튼을 눌러요. 수정 요청은 사유 필수, 게시는 확인 후 카탈로그에 바로 노출돼요." },
    ],
  },
  {
    id: "members",
    title: "회원·수강",
    match: /^\/members$/,
    steps: [
      { target: "page-header", title: "회원 · 수강", body: "가입한 회원과 수강 현황이에요. 메뉴의 빨간 숫자는 가입 승인 대기 인원이에요." },
      { target: "member-filters", title: "검색·필터", body: "이름·이메일로 찾고 역할·소속(사내·외부)·승인 상태로 걸러요. '승인 대기'를 누르면 처리할 가입만 보여요." },
      { target: "member-table", title: "가입 승인", body: "승인 대기 행의 '승인'·'거절' 버튼으로 처리해요. 여러 명은 체크한 뒤 일괄 승인·거절. 거절된 계정은 로그인할 수 없고, 나중에 다시 승인할 수 있어요." },
    ],
  },
  {
    id: "member-detail",
    title: "회원 상세",
    match: /^\/members\/[^/]+$/,
    steps: [
      { target: "member-stats", title: "수강 요약", body: "수강·수료 수, 평균 진도, 수료증 수예요." },
      { target: "member-enrollments", title: "수강 현황", body: "프로그램별 진도와 신청일·수료일이에요." },
      { target: "member-controls", title: "관리", body: "가입 승인·거절과 역할 변경을 여기서 해요. 어드민 권한이 있는 역할을 주면 확인 창이 떠요 — 이 회원이 어드민 콘솔에 로그인할 수 있게 돼요." },
    ],
  },
  {
    id: "web-dashboard",
    title: "웹사이트 대시보드",
    match: /^\/web$/,
    steps: [
      { target: "page-header", title: "웹사이트", body: "홈페이지(바야다홈헬스케어 웹사이트) 운영 현황이에요." },
      { target: "web-kpi", title: "문의 현황", body: "신규·진행 중·최근 7일 접수·처리 완료 문의 수예요. 신규 문의는 메뉴 '문의 CRM'에도 빨간 숫자로 보여요." },
      { target: "web-bookings-kpi", title: "서비스 예약·회원", body: "확정을 기다리는 예약 신청, 다가오는 확정 예약, 최근 7일 '긴급' 상태 방문 기록, 홈페이지 회원 수예요. 누르면 해당 목록으로 가요." },
      { target: "web-recent", title: "최근 문의", body: "가장 최근 접수된 문의예요. 누르면 상세 화면으로 가요." },
      { target: "web-content", title: "홈페이지 콘텐츠", body: "블로그·FAQ·이용자 후기·메인 히어로 개수예요. 내릴 때는 지우기보다 숨김을 쓰세요." },
    ],
  },
  {
    id: "inquiries",
    title: "문의 CRM",
    match: /^\/web\/inquiries$/,
    steps: [
      { target: "page-header", title: "문의 CRM", body: "홈페이지의 상담·신청 폼으로 들어온 문의를 처리해요." },
      { target: "page-actions", title: "CSV 내려받기", body: "지금 걸어 둔 필터 그대로 엑셀용 CSV 로 받아요." },
      { target: "inquiry-status", title: "상태별 보기", body: "신규 → 연락 완료 → 진행 중 → 처리 완료 순서로 처리해요. 장난·중복은 스팸·무효로." },
      { target: "inquiry-filters", title: "유형·기간·검색", body: "문의 유형(서비스 상담·파트너 자격·인력 지원 등), 접수 기간, 이름·연락처·이메일·기관·접수번호로 찾아요." },
      { target: "inquiry-table", title: "문의 목록", body: "접수번호를 누르면 상세 화면에서 상태·담당자·메모를 처리해요." },
    ],
  },
  {
    id: "inquiry-detail",
    title: "문의 상세",
    match: /^\/web\/inquiries\/[^/]+$/,
    steps: [
      { target: "inquiry-content", title: "신청 내용", body: "신청자가 폼에 쓴 내용과 개인정보 동의, 접수 페이지예요." },
      { target: "inquiry-history", title: "처리 이력·메모", body: "통화 내용, 다음 연락 예정 같은 내부 메모를 남겨요(신청자에게 보이지 않아요). 상태·담당자 변경도 여기 기록돼요." },
      { target: "inquiry-controls", title: "상태·담당자", body: "고르는 즉시 저장돼요. '문의 삭제'는 개인정보 파기 요청 때만 — 이력까지 지워지고 되돌릴 수 없어요." },
    ],
  },
  {
    id: "web-bookings",
    title: "서비스 예약",
    match: /^\/web\/bookings$/,
    steps: [
      { target: "page-header", title: "서비스 예약", body: "홈페이지 회원(이용자·보호자)이 마이페이지에서 신청한 방문 서비스 예약이에요." },
      { target: "booking-status", title: "상태별 보기", body: "신청 접수 → 예약 확정 → 방문 완료 순서예요. '신청 접수'가 처리할 일이고, 메뉴의 빨간 숫자도 이 건수예요." },
      { target: "booking-filters", title: "담당자·방문일·검색", body: "담당자(배정 전 포함), 방문일 기간, 예약번호·이용자·연락처·주소로 찾아요." },
      { target: "booking-table", title: "예약 목록", body: "예약번호를 누르면 상세에서 확정·담당자 배정·취소를 해요." },
    ],
  },
  {
    id: "booking-detail",
    title: "예약 상세",
    match: /^\/web\/bookings\/[^/]+$/,
    steps: [
      { target: "booking-content", title: "예약 내용", body: "이용자·연락처·주소·요청 사항이에요. 보호자가 대신 신청했으면 신청자가 따로 보여요." },
      { target: "booking-controls", title: "확정·담당자 배정", body: "담당자(방문 인력)·방문일·시간대·방문 시각을 고르고 '예약 확정'. 확정 뒤에도 담당자·일정을 바꿀 수 있어요. 취소 사유는 회원에게 그대로 보여요." },
      { target: "booking-visit", title: "방문 기록", body: "담당자가 방문 후 홈페이지 마이페이지에서 쓴 기록이에요. 기록이 올라오면 예약이 자동으로 '방문 완료'가 돼요." },
      { target: "booking-history", title: "진행 이력·메모", body: "확정·변경·취소가 회원 마이페이지 진행 이력에 그대로 보여요. '메모'만 내부용이에요." },
    ],
  },
  {
    id: "web-visits",
    title: "방문 기록",
    match: /^\/web\/visits$/,
    steps: [
      { target: "visit-kpi", title: "방문 기록·만족도", body: "누적 방문 기록 수와 회원이 남긴 만족도 평균이에요." },
      { target: "visit-filter", title: "이용자 상태", body: "담당자가 고른 이용자 상태(안정·관찰 필요·긴급)로 걸러요. '긴급'은 먼저 확인하세요." },
      { target: "visit-table", title: "기록 목록", body: "예약번호를 누르면 기록 전문·활력징후·만족도를 봐요. 기록은 작성한 담당자만 쓰고 어드민은 열람만 해요." },
    ],
  },
  {
    id: "web-members",
    title: "홈페이지 회원",
    match: /^\/web\/members$/,
    steps: [
      { target: "page-header", title: "홈페이지 회원", body: "홈페이지 마이페이지를 쓰는 회원이에요. 아카데미와 같은 계정이에요." },
      { target: "member-type", title: "유형·방문 인력·탈퇴 요청", body: "서비스 이용자·보호자·제공자·기관별로 보고, 방문 인력으로 지정한 제공자와 처리할 탈퇴 요청을 따로 모아 봐요." },
      { target: "member-table", title: "회원 목록", body: "이름을 누르면 상세에서 회원 유형 변경·방문 인력 지정·탈퇴 처리를 해요." },
    ],
  },
  {
    id: "web-member-detail",
    title: "회원 상세",
    match: /^\/web\/members\/[^/]+$/,
    steps: [
      { target: "member-profile", title: "회원 정보", body: "연락처·알림 수신 동의·아카데미 수강 요약이에요. 건강·복약 기록 내용은 회원과 연결된 보호자만 볼 수 있어 여기엔 건수만 보여요." },
      { target: "member-controls", title: "관리", body: "회원 유형을 바꾸거나, 자격을 확인한 제공자를 '방문 인력'으로 지정해요. 탈퇴 요청이 있으면 여기서 처리해요(진행 중 예약이 있으면 거부)." },
    ],
  },
  {
    id: "web-blog",
    title: "블로그",
    match: /^\/web\/blog$/,
    steps: [
      { target: "page-header", title: "블로그", body: "홈페이지 블로그 글이에요. 제목을 누르면 편집해요." },
      { target: "page-actions", title: "새 글", body: "본문·게시 설정·정보(주소·카테고리·표지)를 채워 만들어요. '홈페이지에 게시'를 끄면 초안으로 저장돼요." },
      { target: "blog-table", title: "글 목록", body: "게시/초안 상태와 게시일이 보여요. 잠시 내리려면 삭제 대신 게시를 끄세요." },
    ],
  },
  {
    id: "web-blog-edit",
    title: "블로그 글 편집",
    match: /^\/web\/blog\/[^/]+$/,
    steps: [
      { target: "blog-body", title: "본문", body: "제목·요약·본문을 써요." },
      { target: "blog-publish", title: "게시", body: "'홈페이지에 게시'를 켜고 저장하면 바로 공개돼요. 저장하면 홈페이지가 자동으로 다시 만들어져요(설정이 없으면 최대 5분 뒤 반영)." },
      { target: "blog-meta", title: "정보", body: "주소(slug)·카테고리·작성자·태그·표지 이미지 URL 이에요." },
    ],
  },
  {
    id: "web-faq",
    title: "자주 묻는 질문",
    match: /^\/web\/faq$/,
    steps: [
      { target: "page-header", title: "자주 묻는 질문", body: "홈페이지 FAQ 페이지의 카테고리와 질문이에요." },
      { target: "web-manager", title: "카테고리·질문 편집", body: "카테고리를 추가하고 그 안에 질문을 넣어요. 위아래 화살표로 순서를 바꾸고, '홈페이지에 보이기'를 끄면 숨겨져요. 질문이 남은 카테고리는 지울 수 없어요." },
    ],
  },
  {
    id: "web-reviews",
    title: "이용자 후기",
    match: /^\/web\/reviews$/,
    steps: [
      { target: "page-header", title: "이용자 후기", body: "홈페이지 후기 캐러셀에 나오는 후기예요." },
      { target: "web-manager", title: "후기 편집", body: "후기 추가 후 내용·작성자 표기·서비스·별점을 넣어요. 홈 캐러셀은 순서 앞 8개만 보여요. 잠시 내리려면 삭제 대신 숨기기를 쓰세요." },
    ],
  },
  {
    id: "web-hero",
    title: "메인 히어로",
    match: /^\/web\/hero$/,
    steps: [
      { target: "page-header", title: "메인 히어로", body: "홈페이지 첫 화면의 큰 슬라이드예요." },
      { target: "web-manager", title: "슬라이드 편집", body: "배경 이미지·제목·부제·버튼을 넣고 '노출'을 켜요. 노출 슬라이드가 0장이면 홈페이지는 기본 슬라이드를 보여 줘요(빈 화면 방지)." },
    ],
  },
  {
    id: "web-settings",
    title: "사이트 정보",
    match: /^\/web\/settings$/,
    steps: [
      { target: "page-header", title: "사이트 정보", body: "홈페이지 푸터·문의 페이지의 회사·연락처 정보와 문의 알림 메일을 정해요." },
      { target: "web-manager", title: "섹션별 저장", body: "카드마다 따로 저장해요. '기본값으로'는 저장값을 지우고 처음 문구로 돌려요. 회사·연락처를 저장하면 홈페이지가 다시 만들어져요." },
    ],
  },
  {
    id: "site-settings",
    title: "사이트 설정",
    match: /^\/site-settings$/,
    steps: [
      { target: "page-header", title: "사이트 설정", body: "아카데미 홈 문구·섹션·FAQ·푸터·SEO 기본값이에요. 섹션별로 저장하고 저장 즉시 아카데미에 반영돼요." },
      { target: "settings-nav", title: "섹션 목록", body: "기본값에서 바뀐(저장된 값이 있는) 섹션에는 빨간 점이 붙어요. '아카데미에서 보기'로 결과를 바로 확인해요." },
      { target: "settings-sections", title: "편집과 저장", body: "각 섹션 카드 아래 '저장'·'취소'·'기본값으로'. 링크는 /경로(아카데미 안), #위치(홈 안), https://, mailto:, tel: 만 쓸 수 있어요." },
    ],
  },
  {
    id: "feedback",
    title: "피드백",
    match: /^\/feedback$/,
    steps: [
      { target: "page-header", title: "피드백", body: "고객사가 웹사이트·아카데미의 리뷰 모드에서 남긴 수정 요청이에요." },
      { target: "feedback-summary", title: "처리 현황", body: "전체·미처리·최근 7일·재수정 요청 수와 처리율이에요." },
      { target: "feedback-filters", title: "걸러 보기", body: "사이트·상태·유형·소속·화면 영역으로 걸러요." },
      { target: "feedback-table", title: "목록과 일괄 처리", body: "체크하면 여러 건의 상태를 한 번에 바꾸거나 재수정 요청할 수 있어요. 번호를 누르면 상세·댓글 화면이에요." },
    ],
  },
  {
    id: "feedback-detail",
    title: "피드백 상세",
    match: /^\/feedback\/[^/]+$/,
    steps: [
      { target: "page-actions", title: "상태 변경", body: "미처리 → 협의 → 개발완료 → 배포완료 → 디자인 확인완료. 어드민에서는 모든 상태로 바꿀 수 있어요." },
      { target: "feedback-comments", title: "댓글", body: "어드민 댓글은 사이트 카드에 '이름 · 관리자'로 보여요." },
      { target: "feedback-aside", title: "대상 화면·재수정 요청", body: "'위치 보기'는 리뷰 모드가 켜진 브라우저에서 해당 요소를 찾아 강조해요. 개발완료 이후 항목은 사유를 적어 재수정 요청(미처리로 되돌림)할 수 있어요." },
    ],
  },
  {
    id: "roles",
    title: "역할·권한",
    match: /^\/roles$/,
    steps: [
      { target: "page-header", title: "역할·권한", body: "역할별로 어떤 메뉴·작업을 할 수 있는지 정해요. 저장하면 다음 화면 이동부터 바로 적용되고 감사 로그에 남아요." },
      { target: "roles-matrix", title: "권한 매트릭스", body: "칸을 체크해 권한을 주고 빼요. Super Admin 열은 항상 전체 권한(잠금), 파트너 콘솔 행은 파트너 관리자 전용이에요." },
      { target: "roles-save", title: "저장", body: "바뀐 내용(+/−)을 확인하고 저장해요. 다른 관리자가 먼저 바꿨으면 새로고침하라고 알려 줘요." },
      { target: "roles-custom", title: "사용자 정의 역할", body: "필요한 권한만 묶은 역할을 만들 수 있어요. 지정된 회원이 있으면 삭제할 수 없어요." },
      { target: "roles-add", title: "역할 추가", body: "이름을 정하고(기존 역할 권한 복사 가능) 만든 뒤, 매트릭스에서 권한을 체크하고 저장해요. 회원에게는 회원·수강 상세의 '역할'에서 지정해요." },
    ],
  },
  {
    id: "audit",
    title: "감사 로그",
    match: /^\/audit$/,
    steps: [
      { target: "page-header", title: "감사 로그", body: "누가 언제 무엇을 바꿨는지 기록이에요. 지우거나 고칠 수 없어요." },
      { target: "audit-filters", title: "찾기", body: "대상 ID 로 검색하고 처리자·분류로 걸러요. 역할·사이트 설정·웹사이트·피드백 기록은 '전체'에서 보여요." },
      { target: "audit-table", title: "기록", body: "시각·처리자·작업·대상·내용(바뀌기 전 → 후, 메모)이에요." },
    ],
  },
];

/** 언어 경로(/ko)를 뗀 경로 */
export function localPath(pathname: string): string {
  return pathname.replace(/^\/[^/]+/, "");
}

export function tourForPath(pathname: string): TourDef | undefined {
  const p = localPath(pathname);
  return TOURS.find((t) => t.match?.test(p));
}

export function tourById(id: string): TourDef | undefined {
  return TOURS.find((t) => t.id === id);
}
