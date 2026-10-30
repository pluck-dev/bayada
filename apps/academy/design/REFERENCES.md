# 참고 사이트 조사 (2026-10-30)

디자인 시스템 개편(`packages/ui/DESIGN-SYSTEM.md`)을 위해 실제 사이트를 열어 본 기록.
Playwright(Edge, 1280×900, ko-KR)로 첫 화면(`*_fold.png`)과 전체 페이지(`*_full.png`)를 찍었다.

- 스크린샷 위치: `docs/design/references/` (저장소 루트 `docs/` 는 gitignore — 로컬 자료. 제3자 화면이라 커밋하지 않음)
- 앱 전후 비교: `apps/academy/.screens/v6/{before,after}/`, `apps/admin/.screens/v6/{before,after}/` (역시 gitignore)

## 본 페이지

| 파일 | URL |
| --- | --- |
| coursera_home / coursera_catalog / coursera_detail | coursera.org, /search?query=nursing, /professional-certificates/nursing-prerequisites-… |
| inflearn_home / inflearn_catalog / inflearn_detail | inflearn.com, /courses, /course/스프링-핵심-원리-기본편 |
| class101_home | class101.net/ko |
| fastcampus_home / fastcampus_catalog | fastcampus.co.kr, /category_online_dev |
| linkedin_learning | linkedin.com/learning |
| maven_home / maven_catalog / maven_detail | maven.com, /courses, /courses/ai |
| bayada_com | bayada.com (모회사 브랜드) |
| onemedical / mayoclinic | onemedical.com, mayoclinic.org (의료 분야) |

## 관찰 메모

### Coursera
- 상단 띠(개인/비즈니스/대학/정부) + 64px 헤더 + 가운데 검색. 1200px 안팎 그리드, 좌우 여백 일정.
- 카탈로그 카드: 썸네일 → 기관 로고·이름 → 제목(굵게 2줄) → 습득 기술(회색 작게) → `★4.8 · 초급 · 전문 과정 · 1~3개월` 한 줄. **모든 카드가 같은 순서**라 훑기 쉽다.
- 필터는 칩 한 줄(주제·기간·제품·언어·레벨). 결과 수 제목.
- 상세: 이동 경로 → 기관 로고 → 큰 제목 → 짧은 설명 → 파란 등록 버튼 1개(전폭) → 등록자 수. 그 아래 4개 요약 지표를 선 없이 나열.
- 색: 흰 바탕 + 파랑 하나. 하늘색 면은 묶음 표시에만.

### 인프런
- 한국어 서비스 기준점. 상단에 행사 띠·배너가 많아 첫 화면은 붐비지만, **카드와 상세 정보 구조는 정돈**돼 있다.
- 카드: 썸네일 → 제목 2줄 → 강사 → 할인 문구(빨강) → `★5.0 (168) · 1,200+` → 작은 태그. 메타를 한 줄로 압축.
- 상세: 어두운 히어로(제목·평점·강사) + 오른쪽 미리보기 → 탭 바(소개·커리큘럼·수강평·문의) → 오른쪽 고정 가격 카드(가격 → 초록 주 버튼 1개 → 보조 버튼 2개 → 요약 표).
- 가져올 것: 탭 바 + 오른쪽 고정 카드 구조, 메타 한 줄. 버리지 않으면 안 될 것: 행사 띠·다색 아이콘 메뉴.

### CLASS101
- 히어로: 가운데 정렬 제목 2줄 + 주황 버튼 1개 + 텍스트 링크 1개. 주변이 비어 있어 버튼이 저절로 눈에 들어온다.
- 카테고리 메뉴는 아이콘 + 글자 한 줄.

### 패스트캠퍼스 (반면교사)
- 최상단 검정 경고 띠 + 회색 띠 + 빨강 전면 팝업 + 카운트다운 + 채팅 버튼. 빨강이 모든 곳에 있어 무엇이 중요한지 알 수 없다.
- → BAYADA 레드도 같은 위험. 레드 사용처를 규칙으로 묶는다.

### LinkedIn Learning
- 섹션마다 메시지 1개, 사진·일러스트 한 장, 섹션 사이 여백이 넓다(약 96px).
- 지표 4개(26,500 클래스 등)를 선·박스 없이 큰 숫자 + 작은 설명으로. 버튼은 파랑 채움 1 + 파랑 테두리 1.
- 탭(전체·비즈니스·테크·크리에이티브)은 밑줄형.

### Maven
- 세리프 큰 제목 + 작은 회색 메타. 강좌 목록을 그림자 없는 1px 격자로 나눔. 장식 거의 없음.
- 주제 칩은 같은 모양·같은 간격.

### bayada.com (모회사)
- 흰 바탕, 큰 검정 제목, 회색 본문, **레드 사각 버튼 1개 + 회색 사각 보조 버튼**. 모서리는 작다(약 6px). 따뜻한 인물 사진.
- 아카데미가 같은 브랜드로 보이려면 알약형 검정 버튼보다 이 계열이 맞다.

### One Medical · Mayo Clinic (의료)
- 차분한 중립 바탕(베이지·흰색), 본문이 크고 행간이 넓다. 대비가 높다. 버튼 1종.
- 돌봄 종사자(고령·비전문 사용자 포함)를 대상으로 하는 아카데미에 맞는 톤.

## 결론 → 결정

1. 카드 해부를 하나로 고정(`CourseCard`): 유형·기관 → 제목 → 메타 한 줄 → 진도 또는 평점·가격.
2. 레드는 화면당 주요 버튼 1개 + 현재 위치 + 진도. 검정 채운 버튼 폐지.
3. 섹션은 박스 대신 여백(56/88px)과 제목으로 구분. 테두리는 카드·표·요약 패널에만.
4. 본문 16px·행간 1.7, 보조 글자 대비 7:1 이상.
5. 버튼은 10px 둥근 사각(모회사 계열), 칩·배지만 완전한 원형.
6. 상세 = 본문 + 오른쪽 고정 요약 카드(진도/가격 + 주 버튼 1 + 보조 링크).
7. 헤더는 64px 한 줄(유틸리티 띠 제거).
