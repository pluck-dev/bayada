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
- next.config 의 distDir 을 잠깐 `process.env.NEXT_DIST_DIR || ".next"` 로 바꿔 `NEXT_DIST_DIR=.next-buildcheck next build --webpack` 으로 확인하고 되돌렸다(커밋 안 함). .next 를 공유하지 않으니 dev 워커 EPIPE 가 안 난다.
