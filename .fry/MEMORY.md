# 로컬 실행: Supabase 삭제됨, 앱별 .env.local, docker DB 5433

## 원격 DB 상태 (2026-10-21 확인)
- 루트/`packages/db` `.env`의 Supabase(`efekajoclbkrdkhtljov`)는 `tenant/user not found` → 프로젝트 삭제/정지 상태. 접속 불가.
- 로컬 대체: docker 컨테이너 `bayada-db` (postgres:16-alpine, 볼륨 `bayada_pgdata`), 호스트 포트 **5433**.
  - 5432는 이 PC의 윈도우 Postgres 서비스가 점유 → docker-compose.yml 그대로 쓰면 충돌.
  - 접속 문자열은 `127.0.0.1` 사용. `localhost`는 ::1로 붙어서 P1001 실패함.

## env 로딩 함정
- Next 앱은 루트 `.env`를 읽지 않음 (앱 디렉터리 기준 로드) → 루트에만 두면 admin에서 Auth.js `MissingSecret`.
- `apps/{academy,admin,web}/.env.local` 에 루트 `.env` 값 + 로컬 DB URL + 앱 포트별 `NEXTAUTH_URL` 을 넣어 해결. (`.env.*`는 gitignore 대상)

## 포트
- academy 3100, admin 3200, web 3000(기본). 이 PC는 3000을 다른 도커 프로젝트가 써서 web은 `next dev --webpack -p 3001` 로 실행.

## 시드 함정
- `prisma/seed.ts`는 `../src/generated/prisma`(gitignore, 맥에서 생성된 darwin-arm64 엔진)를 import → 윈도우에서 엔진 못 찾음.
- 앱 런타임은 `@prisma/client`(정상)를 쓰므로 영향 없음. 시드만 import를 `@prisma/client`로 바꾼 임시 사본으로 실행.
- 강의 영상: 실제 영상이 없어 seed가 VIDEO 레슨에 BAYADA 공식 유튜브 영상(SAMPLE_YOUTUBE_IDS)을 순환 배정. `VideoPlayer`는 유튜브 URL이면 iframe 임베드, 그 외(mp4/R2)는 `<video>`.
  - 예전에도 유튜브로 대체한 버전이 있었으나 git·GitHub 어디에도 커밋 안 됨(맥 로컬 추정) → 2026-10-21 재구현.
- 시드 계정: admin@bayada.com / student@bayada.com, 비밀번호 password123. 강의 데이터는 bestcareacademy.com(기존 B-Academy)에서 수집한 48개.

# 아카데미 v2: bayada_v2 DB, WordPress 데이터 이전, WP 비밀번호 해시

## WHY: 기존 bayada DB(시드 샘플 48개)는 지우지 않고 별도 DB 사용
- `bayada_v2` (같은 docker bayada-db:5433). academy/admin `.env.local` 이 이쪽을 본다. 옛 `bayada` DB 는 시드 샘플 그대로 남김.
- `prisma db push --force-reset` 은 Prisma 가 AI 실행을 막는다(사용자 명시 동의 필요). 새 DB 를 만들어 피했다.

## 이전 흐름
- 원본: `clients/bayada/bestcareacademy-restore` (WP 복원판) MySQL 127.0.0.1:3307.
- `pnpm --filter @bayada/db import:wp` — legacyWpId 기준 upsert 라 재실행 가능. 전환 직전 최신 백업으로 다시 돌리면 된다.
- 영상 URL = `VIDEO_BASE_URL` + `NNN_<cloudflare uid>.mp4` (restore/scripts/video_map.json). 기본값은 복원판 nginx(8089).
- 원본 수강 2237건 중 761건은 삭제된 회원 기록이라 빠진다(정상). 기존 강의는 전부 `visibility=INTERNAL` 로 넣었다.
- 같은 WP 레슨을 여러 강의가 공유한다 → Lecture.legacyWpId 는 unique 가 아니고 (section, legacyWpId) 로 찾는다.

## 함정
- 회원 비밀번호는 WP 해시 그대로: `$wp$2y$`(WP 6.8, bcrypt(base64(HMAC-SHA384(pw,"wp-sha384")))) / `$P$`(phpass). `shared/src/password.ts` 가 검증하고 로그인 성공 시 bcrypt 로 재저장.
- `createAuthConfig` 는 `@bayada/shared/auth` 에서 import. index 에서 빼 둠 — node:crypto 가 클라이언트 번들에 섞이면 webpack `UnhandledSchemeError`.
- 이메일은 소문자로 저장·조회.

# 아카데미 v2 학습자 사이트: 노출 규칙(INTERNAL), 진도·수료증 번호, 퀴즈 채점, dev 서버 함정

## 노출 규칙은 서버 쿼리에서만 판정
- `apps/academy/src/lib/queries/courses.ts` 의 `visibleCourseWhere(viewer)` / `resolveCourseAccess` 가 유일한 기준. 목록·상세·수강신청 API 모두 이걸 쓴다.
- `isInternal` 은 JWT 에 없다 → `lib/viewer.ts` 의 `getViewer()` 가 매 요청 DB 에서 조직을 읽는다(관리자가 조직 권한 바꾸면 재로그인 없이 반영).
- 수강 중인 사용자는 강의가 ARCHIVED·INTERNAL 로 바뀌어도 상세/강의실 접근 유지. 비수강자는 미리보기(isFree) 레슨만.
- 사내 전용 강의: 비로그인 → 로그인 안내 화면, 로그인했지만 비사내 → 404 (존재 자체를 숨김).
- 2026-10 기준 이전 강의는 전부 INTERNAL → 비로그인 홈/카탈로그는 빈 상태 화면이 정상.

## 진도율·수료증
- 옮겨 온 Enrollment.progressPercent(WP 값)가 Progress 레코드보다 높은 경우가 많다 → 재계산 시 `max(계산값, 기존값)` 으로 내려가지 않게 함. 화면 진도율도 Enrollment 기준.
- 수료증 번호는 **연도별** 일련번호 `BA-YYYY-NNNNNN` (이전 데이터도 BA-2022-000004 식). unique 충돌 시 재시도.
- 퀴즈 레슨은 progress API 로 완료 불가 — `/api/v1/lectures/[id]/quiz` 채점 통과 시에만 완료.
- 퀴즈 정답은 클라이언트에 안 내려준다: FILL_GAP 은 `options[0].text` 의 `|정답|` 을 잘라 segments 만, KEYWORDS 는 문항 텍스트만. 비교는 공백 제거 + 소문자.
- QuizAttempt 통과 기록이 있어도 Progress 가 없는 이전 데이터가 있다(“이미 통과” 표시만 하고 진도는 다시 풀어야 올라감).

## dev 서버 함정 (윈도우)
- prisma generate 를 다른 에이전트가 다시 돌리면, 이미 떠 있는 academy dev 서버는 globalThis 에 캐시된 옛 PrismaClient 를 계속 써서 `Unknown field isInternal` 500 → dev 서버 재시작 필요.
- dev 서버 켜 둔 채 `next build` 하면 빌드는 성공하지만 dev 쪽 워커가 `Jest worker ... EPIPE` 로 죽어 전 페이지 500 → 빌드 후 dev 재시작.
- Git Bash curl `-d` 로 한글 JSON 을 보내면 인코딩이 깨진다. `--data-binary @file.json` 사용.

# 배포: 로컬 Docker 운영 스택(deploy/), standalone 이미지, Prisma debian 엔진

## WHY
- 운영 대상이 AWS 또는 Supabase 로 미정(2026-10-29). 우선 로컬 Docker 로 운영 형태를 맞추고, 옮길 때 환경변수만 바꾸게 했다.
- next.config `output: "standalone"` + 루트 `Dockerfile`(ARG APP). Prisma binaryTargets 에 `debian-openssl-3.0.x` 추가(node:22-slim). rhel 은 Vercel 용으로 유지.

## 함정
- 앱에 public 폴더가 없다 → Dockerfile 에서 COPY 대신 mkdir.
- 컨테이너에선 `AUTH_TRUST_HOST=true` 필요(Auth.js 가 호스트 신뢰 거부).
- 운영 DB 데이터는 `import:wp` 를 `VIDEO_BASE_URL`/`UPLOADS_BASE_URL` 을 미디어 서버 주소로 줘서 넣는다. 개발 DB(bayada_v2)는 8088/8089 주소를 갖고 있어 그대로 덤프하면 안 된다.
- 로컬에서 academy/admin 을 같은 localhost 에 띄우면 Auth.js 기본 쿠키(authjs.*)가 겹친다 → admin 은 `bayada-admin.*` 쿠키 이름 사용.

# 아카데미 v3 학습자 기능: 찜·후기 신고·실습 정원·기관 대시보드(B2B)·초대 링크·수료증 QR

## 후기·평점
- 작성 자격: Enrollment 진도 ≥80% 또는 completedAt (`canWriteReview`). 강의당 1개(upsert). 숨김(HIDDEN) 후기는 작성자가 수정해도 숨김 유지.
- 신고 중복 방지는 별도 테이블 없이 AuditLog(action=`review.report`, target=`Review:<id>`, actorId) 로 판정 + `pg_advisory_xact_lock` 으로 동시 신고 직렬화.
- 함정: Review.updatedAt 은 @updatedAt 이라 reportCount 증가만 해도 바뀌어 화면에 "수정됨"이 뜬다 → 신고 시 `updatedAt: review.updatedAt` 을 명시해 유지. 어드민에서 숨김/공개 처리할 때도 같은 문제가 있다.
- 카드 평점은 `withCardExtras()` 가 groupBy 로 붙임(공개 후기 1건 이상일 때만). 찜 여부도 같이 붙이며 비로그인은 `wished: null`.

## 실습 일정 정원
- 신청 조건: 수강 중 OR (노출 가능 + 무료). 정원은 트랜잭션 안에서 `SELECT ... FOR UPDATE` 로 세션 행을 잠그고 count → create. 시작 시각 이후엔 신청/취소 불가.

## 기관 대시보드 /business
- 권한 `canManageOrg`: organizationId 있고 role ORG_ADMIN 또는 ADMIN. Viewer 에 organizationId 추가함.
- 실데이터상 사내 조직 1곳에 82명(그중 REJECTED 28·PENDING 8) → 직원 수·배정 대상은 APPROVED 만. 배정 API 도 APPROVED 만 허용.
- 배정 = CourseAssignment createMany(skipDuplicates) + 기존 조합 dueAt updateMany + Enrollment createMany(skipDuplicates). 이수 판정은 Enrollment.completedAt.
- 이수 기한은 날짜 입력값의 KST 23:59:59 로 저장.
- 초대: 메일 인프라가 없어 토큰 링크를 만들어 관리자가 복사·전달. 수락은 **초대받은 이메일로 로그인한 경우만**(링크 전달 악용 방지). 수락 시 User.organizationId 를 덮어쓴다(사내 조직 → 외부 기관이면 INTERNAL 강의 열람권이 사라짐, 화면에서 경고).
- 가입 페이지는 `?callbackUrl=` 을 지원(초대 → 가입 → 초대 페이지로 복귀). useSearchParams 대신 window.location 을 읽어 Suspense 경계 문제를 피함.
- CSV: UTF-8 BOM + `=+-@` 로 시작하는 셀 앞에 `'` (엑셀 수식 주입 방지). 소스에는 `﻿` 이스케이프로 둔다(prettier/에디터가 보이지 않는 문자로 바꾸는 경우가 있었음).

## 수료증 QR · 절대 주소
- QR·인쇄물의 검증 URL 은 요청 호스트가 아니라 `SITE_URL`(NEXT_PUBLIC_SITE_URL, 없으면 academy.bayada.co.kr) 기준. 로컬 `.env.local` 값이 web 포트(3000)라 로컬 QR 은 3000 을 가리킨다 — 운영 값만 맞으면 됨.
- `qrcode` 로 서버에서 SVG 생성해 심는다(클라이언트 번들 없음).

## 약관 페이지
- Page.content(어드민 편집 HTML)는 `lib/sanitize-html.ts` 허용목록으로 정리 후 출력. 원본 약관 끝에 WP 시절 "ZZ테스트 문구" 가 실제로 들어 있다(데이터 문제, 코드 아님).

## 홈 섹션 노출 규칙
- ⑥ 파트너: Provider.isPartner && logo 있는 곳만. ⑨ 성과 지표: 값 0 인 항목은 숨김, 개설 프로그램 수는 보는 사람 기준 노출 규칙 적용(비로그인은 0 → 숨김). ⑩ 후기: 보는 사람이 볼 수 있는 강의의 공개 후기만.
- CountUp 은 화면에 들어올 때만 0→값. full-page 스크린샷에서는 0 으로 찍히니 검증 시 해당 섹션으로 스크롤 후 찍을 것.

## 빌드 확인 (dev 서버 켠 채)
- next.config 의 distDir 을 잠깐 `process.env.NEXT_DIST_DIR || ".next"` 로 바꿔 `NEXT_DIST_DIR=.next-buildcheck next build --webpack` 으로 확인하고 되돌렸다(커밋 안 함). .next 를 공유하지 않으니 dev 워커 EPIPE 가 안 난다(확인함). 단 next build 가 tsconfig.json include 에 `.next-buildcheck/types` 를 추가하고 next-env.d.ts 도 건드리니 빌드 후 둘 다 되돌릴 것.

# 어드민 2차: 파트너 콘솔(PARTNER_ADMIN) 소유권, 후기 신고 처리, 실습 일정 KST, 정적 문서, 기관 B2B

## 파트너 관리자 RBAC — 서버에서 providerId 로 막는다
- PARTNER_ADMIN 은 ADMIN_ROLES 에 들어가 로그인은 되지만 권한은 `partner.console` 하나. 첫 화면 `/partner-console`.
- providerId 가 없는 PARTNER_ADMIN 은 `getAdminUser()` 가 null, auth signIn 콜백도 거부 → 제공기관 해제 즉시 콘솔 차단.
- 프로그램 본문·커리큘럼 액션은 `PROGRAM_EDIT = ["program.write","partner.console"]` + `assertEditable(courseId, user)` 가 소유 확인. 다른 기관 프로그램은 "찾을 수 없습니다"(존재 숨김). 파트너는 게시·보관된 프로그램도 못 고친다(LOCKED_STATUSES 밖이라 따로 막음 — 안 막으면 승인 없이 학습자 화면이 바뀜).
- create/update 에서 파트너가 보낸 providerId·visibility·featured 는 무시하고 서버 값으로 덮는다.
- 워크플로우: TRANSITIONS 의 submit 에만 PARTNER_ADMIN 추가. transitionProgram 은 파트너면 submit 외 즉시 거부 + 소유 확인. Playwright 로 서버 액션을 직접 재전송(start_review/approve/다른 기관 submit·update) 해도 막히는 것 확인함.
- 파트너 관리자 지정은 /partners/[id] 에서만(학습자 계정만). 회원 화면 역할 변경은 PARTNER_ADMIN 을 거부하고, 다른 역할로 바꿀 때 providerId 를 비운다.
- 파트너 콘솔 통계는 인원·수료율만. W7 피그마의 "최근 수료자(김○○)" 목록은 과업 지시(학습자 식별정보 금지)에 따라 뺐다.

## 후기 신고 = 게시 중 && reportCount > 0
- 숨김은 reportCount 유지. 다시 게시·신고 기각은 운영자 검토 완료로 보고 reportCount 를 0 으로(이전 값은 AuditLog detail). 안 그러면 대시보드 "미처리 신고"가 영원히 안 줄어든다.

## 함정
- `"use client"` 파일에서 export 한 상수(EMPTY_PROGRAM)를 서버 컴포넌트가 import 하면 값이 아니라 클라이언트 참조라 스프레드하면 `{}` → /programs/new 가 500 이었다. 폼 기본값은 `lib/program-defaults.ts` 같은 일반 모듈에 둔다.
- 실습 일정 datetime-local 은 KST 로 해석(`lib/kst.ts`, `+09:00`). formatDate/formatDateTime 에 `timeZone: "Asia/Seoul"` 추가 — Docker(UTC)에서 시간이 9시간 밀리지 않게.
- 신청자 CSV: UTF-8 BOM + `=,+,-,@` 로 시작하는 셀 앞에 `'` (엑셀 수식 주입 방지). 내려받기는 `session.export` 로 감사 로그.
- 정적 문서 slug 는 terms/privacy/refund 고정(`lib/pages.ts`). 저장 시 script·iframe·on* 속성·javascript: 거부, 미리보기는 sandbox iframe(스크립트 불가) + 아카데미 `.legacy-content` 스타일. 이관된 약관은 WP 원문이라 `<p>` 없이 줄글이 섞여 있다(아카데미에 아직 문서 라우트 없음, 2026-10-29).
- 동시 수정: 문서 저장은 편집 시작 시점 updatedAt 을 같이 보내 다르면 거부.
- 기관 목록·상세는 옛 @bayada/ui 화면을 새 디자인으로 교체. 기관 관리자 지정은 STUDENT↔ORG_ADMIN 사이만(운영 계정 강등 사고 방지). 사내 조직(isInternal) 생성은 일부러 폼에 없다.
- 빌드 확인은 `apps/admin-buildcheck` 형제 폴더에 src·설정 복사 + node_modules 정션으로 했다(dev 의 .next 를 안 건드림). 지울 때 정션을 `rmdir` 로 먼저 끊고 폴더 삭제.

# 바야다 인증(BC-): 정책은 전부 CredentialProgram 데이터, 심사 상태 전이, 판정 계산, 갱신 알림, 공유 index 커밋

## WHY: 정책 미확정 → 하드코딩 금지
- 선수 강의·시험/실기 합격 점수·실기 여부·유효기간(null=영구)·갱신 알림 일수·평가 기준 문구는 전부 어드민 `/credentials/programs` 에서 과정별로 설정. 새 과정 기본값도 스키마 기본값(유효기간 영구) 그대로.
- 과정 삭제는 신청·발급이 하나라도 있으면 막는다(onDelete Cascade 라 발급 인증까지 날아감) → 비공개로 전환.

## 상태 전이·권한 (admin `lib/actions/credentials.ts`)
- SUBMITTED →(평가 시작, 심사위원)→ EVALUATING →(점수 임시 저장 / 평가 완료)→ EVALUATED →(운영자 승인=발급 | 반려). EVALUATED→EVALUATING 재평가 가능. 반려는 SUBMITTED/EVALUATING/EVALUATED 어디서나, 사유 필수(학습자에게 그대로 보임).
- 심사위원 = `credential.evaluate`(CLINICAL_REVIEWER·ADMIN), 승인·반려·취소 = `credential.approve`(CONTENT_MANAGER·ADMIN), 과정 CRUD = `credential.program`. PARTNER_ADMIN 은 없음.
- 모든 전이는 `updateMany where status in (기대 상태)` → count≠1 이면 거부(동시 클릭 이중 처리 방지). 전이마다 AuditLog `credential.*` (target `CredentialApplication:<id>`), 발급은 `Credential:<id>` 로 한 번 더.
- 합격/불합격은 **저장 필드가 없다** — 매번 현재 과정 기준으로 `judge()` 계산. 평가 완료 시점 점수·기준·결과는 AuditLog detail 에 남김. 승인 대기 중에 기준을 바꾸면 판정이 바뀐다(과정 폼에서 경고).
- 번호 `BC-YYYY-NNNNNN` 연도(KST)별 일련번호. 승인 트랜잭션 안에서 `pg_advisory_xact_lock(hashtext('credential-number'))` 로 직렬화 후 max+1 (P2002 재시도는 PG 트랜잭션이 abort 돼서 안 씀). expiresAt = 발급일 + validityMonths.

## 학습자 쪽 규칙 (academy `lib/queries/credentials.ts` eligibility — 화면과 신청 API 공용)
- 신청 가능: 공개 과정 + 선수 강의 전부 Enrollment.completedAt + 진행 중 신청 없음 + (유효 인증 없음 또는 갱신 알림 기간 진입). 갱신 = 새 Credential 행 발급(이전 것은 그대로 만료).
- 진행 중 신청 1건 보장은 unique 제약이 없어 (user, program) advisory lock 트랜잭션으로.
- 선수 강의가 보는 사람에게 노출 불가(INTERNAL·비게시)면 제목을 숨기고 "임직원 전용 프로그램" 표기(존재 숨김 규칙). 본인 수강 기록이 있으면 보임.
- 갱신 알림: 메일 인프라가 없어 `/dashboard`·`/dashboard/certificates` 렌더 시 `takeRenewalNotices` 가 배너 대상 반환 + 처음 본 시각을 renewalNotifiedAt 에 기록 → 어드민 '발급된 인증'의 "갱신 알림 확인" 열. (GET 렌더에서 쓰기하는 건 의도된 것)
- D-day 는 양쪽 다 올림(ceil)으로 통일. '만료 임박' 은 과정마다 알림 일수가 달라 DB where 로 못 거르고 메모리에서 거른다.
- 공개 검증 `/verify/BC-…` 는 같은 라우트에서 접두어로 분기(`CredentialVerify`). 상태: 유효 / 만료 / 취소(revokedAt). 출력 `/credentials/[number]/print` 는 취소·만료면 인쇄 숨김 + 도장 표시.

## 함정: 여러 에이전트가 같은 working tree·index 를 공유할 때 커밋
- index 가 공유라 다른 에이전트가 stage 한 파일(예: cart 삭제)이 내 커밋에 섞인다. 커밋 전 `git diff --cached --stat` 확인, 남의 staged 는 잠시 reset 후 커밋하고 되돌려 놓는다.
- 남의 미커밋 hunk 가 섞인 공유 파일은 `HEAD 내용 + 내 치환` 을 `git hash-object -w` → `git update-index --cacheinfo` 로 index 에만 넣어 내 hunk 만 커밋.
- prettier 설정 파일이 없다(기본 80자). 돌리면 기존 120자 스타일과 달라지니 `--print-width 120`.
