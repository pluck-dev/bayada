# BAYADA Academy 디자인 시스템

> 적용 범위: `apps/academy`(학습자 사이트) · `apps/admin`(운영 콘솔).
> 단일 소스: 토큰 `packages/ui/src/theme.css`, 컴포넌트 `packages/ui/src/components/*`.
> 참고 사이트 조사 원문·스크린샷 위치: `apps/academy/design/REFERENCES.md`.

## 0. 왜 다시 정리했나

고객 피드백: "사이트가 어수선하다." 화면을 하나씩 보면 큰 문제가 없는데, 모아 보면
같은 역할의 요소가 화면마다 다르게 생겼다.

- 버튼이 화면마다 다르다: 빨강 알약, 검정 알약, 테두리 알약, 사각 버튼이 한 화면에 섞임.
  주요 행동이 2–3개씩 동시에 강조됨.
- 모든 섹션이 테두리 박스 안에 들어 있다(소개·커리큘럼·수료 안내·제공기관·후기 폼·FAQ가 전부 박스).
  박스가 많을수록 위계가 사라진다.
- 모서리가 6종(`md`/`lg`/`xl`/`2xl`/`3xl`/`full`) 섞여 있다.
- 보조 글자색이 `#71717a`(대비 4.8:1)·`#a1a1aa`(2.6:1) — 고령 학습자에게 흐리다. 본문 14–15px.
- 앱마다 UI 조각이 따로 있다: academy `components/ui/*`, admin `components/ui/*`, 옛 `@bayada/ui`(다른 빨강 `#ce0e2d`).

## 1. 참고 사이트에서 가져온 것

| 사이트 | 잘하는 것 | 우리 결정 |
| --- | --- | --- |
| **Coursera** (홈·검색·상세) | 1200px 그리드, 카드 해부가 일정함(로고·기관 → 제목 → 기술 → 평점·수준·기간 한 줄). 필터는 칩 한 줄. CTA는 한 색(파랑)만. 상세는 왼쪽 정보·오른쪽 고정 행동 | 카드 정보 순서 고정(유형·기관 → 제목 → 메타 → 진도/가격). 카탈로그 필터 칩 한 줄. 상세 = 본문 + 오른쪽 고정 요약 카드 |
| **LinkedIn Learning** | 큰 여백, 섹션마다 한 가지 메시지, 무채색 바탕에 파랑 CTA 하나. 숫자 지표는 선 없이 크게 | 섹션 간 88px 리듬, 지표는 테두리 없는 큰 숫자 |
| **Maven** | 강한 타입 위계(큰 제목 + 작은 메타), 리스트형 카드는 선 하나로 구분. 장식 없음 | 제목은 크게·굵게, 메타는 13px 회색 한 줄. 카드에 그림자 대신 1px 선 |
| **인프런** | 한국어 메타 밀도 처리(평점·수강생 한 줄), 상세의 탭 바(소개·커리큘럼·수강평) + 오른쪽 가격 카드 | 상세 섹션 바로가기 탭 바 유지, 오른쪽 카드에 진도/가격 + 주요 버튼 1개 |
| **CLASS101** | 히어로에 문장 2줄 + 버튼 1개, 주변을 비워 버튼이 저절로 보임 | 히어로 주요 버튼 1개 + 보조는 테두리 버튼 |
| **패스트캠퍼스** | (반면교사) 띠 배너·팝업·카운트다운·빨강 남용 → 긴급하지만 피곤함 | 빨강은 화면당 주요 행동 1개 + 현재 위치 표시에만. 띠 배너·카운트다운 쓰지 않음 |
| **bayada.com** (모회사) | 흰 바탕, 레드 사각 버튼 1개 + 회색 보조 버튼, 큰 제목, 따뜻한 사진 | 버튼은 알약 대신 10px 둥근 사각(모회사와 같은 계열). 레드는 채운 버튼 1종 |
| **One Medical / Mayo Clinic** (의료) | 차분한 중립 바탕, 넉넉한 행간, 글자 대비가 높음 | 본문 16px·행간 1.7, 보조 글자 `neutral-600`(대비 7.7:1) |

## 2. 원칙

1. **한 화면 한 주요 행동.** `variant="primary"`(레드)는 화면당 최대 1개. 나머지는 `secondary`.
2. **레드는 아껴 쓴다.** 주요 버튼, 현재 위치(탭·메뉴 표시선), 진도 막대, 브랜드 로고. 배지·아이콘 장식에 쓰지 않는다.
3. **박스 대신 여백.** 섹션 구분은 여백 + `SectionHeader`. 테두리 카드는 "한 덩어리 정보"(프로그램 카드, 요약 카드, 표)에만.
4. **위계는 크기와 굵기로.** 색·배경으로 강조하지 않는다. 한 블록 안 글자 크기는 최대 3단.
5. **읽기 쉬움이 먼저.** 학습자 화면 본문 16px, 터치 영역 44px(입력 높이), 보조 글자도 `muted`(600).
6. **어드민은 같은 토큰, 다른 밀도.** 같은 색·모서리·버튼 위계, 크기만 `sm`/`compact`.

## 3. 토큰 (theme.css)

### 색

- 원시: `brand-50…900`(500 = `#E31B34`), `neutral-0…900`(zinc).
- 의미 토큰 — 코드는 이것만 쓴다:

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `ink` | neutral-900 | 제목·본문 |
| `ink-soft` | neutral-700 | 본문 보조, 라벨 |
| `muted` | neutral-600 | 설명·메타 (대비 7.7:1) |
| `subtle` | neutral-500 | 플레이스홀더·아이콘 |
| `canvas` | #fff | 페이지 바탕 |
| `surface` | neutral-50 | 묶음 바탕(섹션 띠, 지표 타일, 사이드 패널) |
| `surface-sunken` | neutral-100 | 진도 트랙, 스켈레톤, 비활성 |
| `line` / `line-soft` / `line-strong` | 200 / 100 / 300 | 카드 테두리 / 행 구분 / 입력 테두리 |
| `brand` / `brand-hover` / `brand-soft` | 500 / 600 / 50 | 주요 버튼 / hover / 옅은 강조 |
| `success` `warning` `info` `danger` (+ `-soft`, `-line`) | | 상태. danger(`#B91C1C`)는 브랜드 레드와 구분되는 진홍 |

옛 이름(`--brand`, `--border`, `--surface-3`, admin `fg`·`brand-bg`)은 호환 별칭으로 남겨 두었다.

### 타입 (Pretendard, `word-break: keep-all`)

| 클래스 | 크기/행간 | 굵기 | 쓰는 곳 |
| --- | --- | --- | --- |
| `text-display` | 44 / 1.2 | 700 | 홈 히어로 제목 (모바일 34) |
| `text-h1` | 32 / 1.3 | 700 | 페이지 제목 (`PageHeader`, 모바일 28) |
| `text-h2` | 24 / 1.35 | 700 | 섹션 제목 (`SectionHeader`) |
| `text-h3` | 20 / 1.4 | 600 | 카드 묶음·대화상자 제목 |
| `text-title` | 17 / 1.45 | 600 | 카드 제목 |
| `text-body-lg` | 17 / 1.7 | | 페이지 설명 |
| `text-body` | 16 / 1.7 | | 학습자 본문 기본 |
| `text-body-sm` | 14 / 1.6 | | 보조 본문, 버튼, 어드민 본문 |
| `text-caption` | 13 / 1.5 | | 메타·도움말·어드민 표 |
| `text-micro` | 12 / 1.4 | | 배지·표 머리글만 |

`cn()`(tailwind-merge)에 이 이름들을 font-size 그룹으로 등록했다 — 안 하면 `text-h2 text-ink` 중 하나가 지워진다.

### 간격·폭·모서리·그림자·움직임

- 간격: Tailwind 4px 스케일. 묶음 안 8/12/16, 블록 사이 24/32, 섹션 사이 `section-y`(56 → 88px).
- 폭: `container-page` 1200, `container-reading` 760(약관·폼·본문), `max-w-auth` 440.
- 모서리: `rounded-md` 8(어드민 컨트롤) · `rounded-lg` 10(버튼·입력) · `rounded-xl` 14(카드) · `rounded-2xl` 18(대화상자·큰 패널) · `rounded-full`(배지·칩·아바타). `rounded-3xl`은 18로 수렴시켰다.
- 그림자: 떠 있는 것에만 — `shadow-md`(메뉴), `shadow-lg`(대화상자). 카드는 그림자 없이 1px 선. hover는 테두리만 진하게(`lift`), 움직임 없음.
- 포커스: 2px `brand-600` 외곽선 + 2px 간격(전역 `:focus-visible`).
- 움직임: 기본 160ms `cubic-bezier(.2,0,0,1)`. `prefers-reduced-motion` 이면 끔.
- z-index: `z-sticky` 20 · `z-header` 40 · `z-dropdown` 50 · `z-overlay` 60 · `z-dialog` 70 · `z-toast` 80.
- 반응형: Tailwind 기본(sm 640 · md 768 · lg 1024 · xl 1280).

## 4. 컴포넌트 (`@bayada/ui`)

| 컴포넌트 | 요점 |
| --- | --- |
| `Button` / `buttonVariants()` | primary · secondary(기본) · ghost · danger · link / xs·sm·md·lg / `loading`, `leftIcon`, `rightIcon`, `fullWidth`. 링크는 `<Link className={buttonVariants({...})}>` |
| `IconButton` | `label` 필수(접근성 이름). ghost · secondary · overlay |
| `Badge` · `tagClass()` | tone: neutral · brand · success · warning · info · danger · inverse / soft · outline. 필터 칩은 `tagClass({active})` |
| `Card` (+`CardMedia` `CardHeader` `CardBody` `CardFooter`) | outline(기본) · surface · plain |
| `CourseCard` | **유일한 프로그램 카드.** 썸네일 → 유형·기관 → 제목(2줄) → 메타 → 진도 또는 평점·가격. `layout="horizontal"` 목록형 |
| `Input` `Textarea` `Select` `Checkbox` `Radio` `Switch` `Field` | label · help · error 내장. md 44px(학습자) / sm 32px(어드민). 클래스만 필요하면 `controlClass()` `selectClass()` `textareaClass()` |
| `Tabs` · `TabNav` | 패널 전환 / 라우트 탭. underline · pill |
| `Accordion` | `<details>` 기반(서버 컴포넌트 가능). divided · boxed |
| `Table` `Th` `Td` `Tr` `TableWrap` `DataTable` · `tableClasses` | compact(어드민) / comfortable |
| `EmptyState` | 아이콘 + 제목 + 설명 + 행동 1개. 박스 없이(`framed` 선택) |
| `Notice` | 안내 띠: neutral · info · success · warning · danger · brand |
| `Skeleton` · `Spinner` | |
| `Dialog` | 네이티브 `<dialog>`. 제목·설명·본문·바닥 행동 |
| `FeedbackProvider` · `useFeedback()` · `useToast()` | 토스트 + 확인 대화상자 |
| `Breadcrumb` · `Pagination` | `LinkComponent={Link}` 로 next/link 사용 |
| `Avatar` · `ProgressBar` · `StatCard` | |
| `PageHeader` · `SectionHeader` · `DescriptionList` · `Container` · `Stack` | 페이지 구조 |

## 5. 페이지 구조 규칙

```
<Header/>                       64px 한 줄 (유틸리티 띠 없음)
<main>
  <div class="container-page page-y">   ← 일반 페이지
    <PageHeader eyebrow? title description? actions?/>
    …본문: 섹션 사이 48–64px, 섹션은 SectionHeader 로 시작…
  </div>
</main>
<Footer/>
```

- 읽기 위주 페이지(약관·인증서 검증·폼)는 `container-reading`.
- 로그인·가입은 `max-w-auth` 카드 1개, 페이지당 primary 1개.
- 홈만 예외: 섹션마다 `section-y`, 띠 배경은 한 번 걸러 `surface`.
- 어드민: 사이드바 + `PageHeader size="compact"` + 표/카드. 같은 토큰, `sm`/`xs` 크기.

## 6. 상태 색 매핑 (양쪽 앱 공통)

| 의미 | tone | 예 |
| --- | --- | --- |
| 완료·유효·게시·승인 | success | 수료 완료, 유효, PUBLISHED, CONFIRMED |
| 진행 중·심사 중 | info | 학습 중, EVALUATING, IN_REVIEW |
| 대기·임박·주의 | warning | 승인 대기, 만료 임박, PENDING |
| 반려·취소·만료·오류 | danger | REJECTED, 환불, 만료, 취소 |
| 분류·초안·보관 | neutral | 단과 강좌, DRAFT, ARCHIVED |
| 강조 1개 | brand | 신규, 추천 (화면당 드물게) |

## 7. 하지 말 것

- 레드 채운 버튼 2개 이상 / 검정 채운 버튼(`bg-ink` 버튼)
- 섹션 전체를 테두리 박스로 감싸기, 박스 안에 박스
- 장식 그라데이션·블러 원·그림자 카드
- 12px 미만 글자, `neutral-400` 이하 색의 읽어야 하는 글자
- 앱 안에 Button/Badge/Card/EmptyState 를 새로 만들기 — `@bayada/ui` 에 추가할 것
