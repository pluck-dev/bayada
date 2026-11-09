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

# 아카데미 v2 학습자 사이트: 노출 규칙(둘러보기 누구나·수강은 INTERNAL 제한), 진도·수료증 번호, 퀴즈 채점, dev 서버 함정

## 노출 규칙은 서버 쿼리에서만 판정 — 둘러보기 ≠ 수강 (2026-11-09 사용자 결정으로 변경)
- **둘러보기**: `browsableCourseWhere()` = PUBLISHED 면 누구나(비로그인 포함). 목록·홈·검색·상세·후기·통계는 전부 이것. INTERNAL 도 목록·상세에 나오고 카드·상세에 '사내 전용' 배지만 붙는다.
- **수강**: `visibleCourseWhere(viewer)`·`isCourseListed` = PUBLIC 또는 사내 조직(isInternal). 수강 신청·결제·찜·실습 신청·기관 배정 API 가 이것으로 막는다.
- `resolveCourseAccess` 결과: ok / login(INTERNAL+비로그인 → 상세는 보여 주고 수강·미리보기 누르면 로그인) / restricted(INTERNAL+임직원 아닌 회원 → 상세에 '임직원 전용' 안내, 수강·찜 버튼 숨김, 강의실 URL 은 상세로 돌려보냄) / notfound(비게시).
- 강의실(레슨) 페이지는 비로그인이면 무조건 로그인으로 보낸다(미리보기 레슨 포함) — "강의를 보려는 순간 로그인".
- `isInternal` 은 JWT 에 없다 → `lib/viewer.ts` 의 `getViewer()` 가 매 요청 DB 에서 조직을 읽는다(관리자가 조직 권한 바꾸면 재로그인 없이 반영).
- 수강 중인 사용자는 강의가 ARCHIVED·INTERNAL 로 바뀌어도 상세/강의실 접근 유지. 비수강자는 미리보기(isFree) 레슨만.
- 사이트맵·OG 표지(/api/cover)는 여전히 PUBLIC 만, INTERNAL 상세는 noindex.
- 옛 규칙(INTERNAL 은 비로그인에게 숨김 → 빈 상태 화면)은 폐기. 이제 NoProgramsNotice 는 게시 프로그램이 0개일 때만 뜬다.
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

## AWS 운영: EC2 한 대 (2026-11-09 구축, deploy/ec2/)
- 위상(2026-11-09 사용자 결정): 이 EC2(무료 플랜)는 **개발·시연용**. 정식 오픈 때 서버를 새로 옮긴다 → 유료 전환·S3 백업·무중단 배포는 지금 하지 않음. 옮길 때 필요한 것: DB pg_dump(backups 폴더), /srv/bayada/media 복사, deploy/ec2/.env 비밀값(새로 생성 권장), 도메인 확정 후 *_HOST 바꿔 재빌드, 수료증 QR/검증 주소가 새 도메인을 가리키게(이미 발급분은 sslip 주소 → 리다이렉트 필요), SES 인증·SMTP 파라미터(/bayada/smtp_url) 재설정.
- 브랜치(2026-11-09 사용자 결정): 지금 로컬·EC2 모두 `feat/academy-v2` 기준(main 은 2026-06 상태, deploy/ec2 도 없음). **서버·계정 이전 재배포 때 feat/academy-v2 를 main 에 합치고 그 뒤로는 main 에서 배포**한다. 그 전까지 main 은 건드리지 않는다.
- 계정 bayada-sim(446147096014), 서울. 인스턴스 bayada-prod `i-0bcbf1a85540c65bb` m7i-flex.large(8GB, 무료 플랜 허용 타입 중 최대), 60GB gp3(DeleteOnTermination=false), 고정 IP 54.116.157.4, SG bayada-web(80/443 전체, 22 는 사무실 IP 218.50.226.163/32 만). SSH 키는 PC `~/.ssh/bayada_ec2` (공개키만 AWS 에 import).
- WHY 단일 EC2 + compose: 사용자 결정(라이트세일은 확장 어려움). 나중에 RDS/S3 로 뺄 때 DATABASE_URL·MEDIA_HOST 만 바꾼다.
- 도메인 전에는 sslip.io 호스트(academy./admin./media.54-116-157-4.sslip.io, web 은 루트)로 Caddy 가 Let's Encrypt 자동 발급. 도메인 바꾸면 `.env` 의 *_HOST 수정 후 **재빌드 필수**(NEXT_PUBLIC_SITE_URL 이 빌드에 박힘) + DB 의 미디어 URL 치환.
- 서버 경로: 코드 /srv/bayada/app (git archive 로 전송, git 저장소 아님), 미디어 /srv/bayada/media/{videos,uploads}(Caddy 가 직접 서빙), 백업 /srv/bayada/backups. 비밀값은 서버의 deploy/ec2/.env 에만 있음. 배포한 커밋은 /srv/bayada/app/DEPLOYED_COMMIT 에 적는다(2026-11-09 21966ff 부터) — git archive 라 이것 말고는 커밋을 알 길이 없다. 재배포 절차: `git archive -o x.tar.gz HEAD` → scp → app 폴더에 tar -xzf 덮어쓰기(.env 보존) → `nohup docker compose -f deploy/ec2/docker-compose.yml --env-file deploy/ec2/.env up -d --build web academy admin` (빌드 약 5분, 앱 컨테이너만 재생성·DB/Caddy 유지). 스키마 바뀐 커밋이면 마이그레이션 먼저 확인.
- 초기 데이터 = 로컬 Docker DB(5435) pg_dump 에서 localhost:4300/8089/8088 주소를 media/academy 호스트로 sed 치환해 넣음.
- 서버 cron(ubuntu): 04:00 deploy/ec2/backup.sh(DB 덤프 14일, **같은 디스크** — S3 복사 아직 없음), 09:00 /srv/bayada/renewals.sh(인증 갱신 메일 API). renewals.sh 는 .env 를 source 하지 않는다(MAIL_FROM 의 공백·<> 때문에 sh 가 깨짐) → grep 으로 값만 꺼냄.
- 함정: 웹(web)은 빌드 때 data/_enriched-content.json 을 import → .dockerignore 에서 그 파일만 예외. 러너 이미지의 .next/cache 는 node 소유여야 next/image 캐시가 써진다.
- 함정: 계정이 "무료 플랜"이라 6개월 또는 크레딧 소진 시 종료된다 → 운영 전 유료 플랜 업그레이드 필요(크레딧 유지). AWS 콘솔 작업은 Oinzi 바야다 프로필 + CloudShell(`type`/`press` 로 입력, 출력은 스크린샷으로 확인).

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

# 커리어 패스웨이(Pathway): 시드 0건, 정보 기준일·면책 필수, 단계 상태 판정, 게시 조건, i18n 현황

## WHY: 콘텐츠는 어드민 작성 데이터, 시드 없음
- 국가별 면허·이민 요건은 사실 확인·책임 문제가 있어 코드/시드에 예시 패스웨이를 넣지 않았다(0건 출고). 아카데미는 0건이면 /pathways 빈 상태, 홈 ⑤ 숨김.
- 공개 상세는 항상 정보 기준일 + 면책 고지 박스를 본문보다 먼저 보여 준다. disclaimer 가 비면 `DEFAULT_PATHWAY_DISCLAIMER`(academy `lib/queries/pathways.ts`) — 어드민 폼 placeholder 에도 같은 문구가 복사돼 있으니 바꿀 땐 둘 다.
- 어드민 도움말의 BAYADA 해외 거점(독일·아일랜드·뉴질랜드·한국, 인도는 제휴) 은 search/01.txt·05.txt(bayada.com/international) 근거. 패스웨이 본문에 쓰라는 뜻이 아니라 "취업·이민 지원 약속 금지" 경고용.

## 게시 조건·저장 규칙 (서버 액션에서 강제)
- 게시: infoAsOf 있고 단계 ≥1. 게시 중엔 기준일 비우기·단계 0개 저장 거부, 삭제도 거부(먼저 게시 중단).
- 단계 연결은 PUBLISHED 프로그램 / active CredentialProgram 만. 저장은 단계 전체 교체(deleteMany+createMany) — 단계 id 는 저장마다 바뀐다(목표는 Pathway 단위라 무관).
- infoAsOf 는 날짜만 의미 → `YYYY-MM-DDT00:00:00Z` 로 저장. 화면은 UTC 자정이라 KST·UTC 어디서 읽어도 같은 날짜.
- 동시 수정: baseUpdatedAt 비교. 단계만 바뀌어도 updatedAt 을 명시 갱신해 검사가 걸리게 함.

## 학습자 단계 상태
- 프로그램 단계: Enrollment(completedAt → 수료, 있으면 학습 중, 0% 는 "수강 신청함"). 인증 단계: Credential(revokedAt null, 만료 전). 자유 단계는 자동 판정 불가 → 그 뒤 단계를 하나라도 마쳤으면 지나간 것으로 본다(`pathwayProgress`).
- 연결 프로그램이 보는 사람에게 비노출(INTERNAL 등)이고 수강 기록도 없으면 링크 대신 "열람 권한이 있는 회원에게만" 안내(존재·제목 숨김 규칙 유지).
- 인증 링크는 `/[locale]/certifications/[slug]`(인증 기능 라우트). 커리어 목표는 `/dashboard/goals` — 게시 중단된 패스웨이의 목표는 숨김(행은 남음, 재게시 시 복귀).

## i18n 현황 (2026-10-29 점검)
- 로케일은 ko/en/ja/zh (피그마 3차는 ko/en/ja/de — de 없음, /de 는 /ko/de 로 리다이렉트돼 404). 비ko 로케일은 크래시 없이 전부 한국어로 렌더.
- 미들웨어가 Accept-Language 로 리다이렉트 → 영어 브라우저는 / → /en 으로 가서 한국어 화면을 본다. `<html lang="ko">` 고정, 메타 제목도 한국어, sitemap 은 같은 한국어 페이지를 4개 로케일로 낸다(중복 콘텐츠).
- 사전(dictionaries)을 쓰는 화면은 cart·orders·register 3곳뿐, 나머지 학습자 UI 문자열은 하드코딩 한국어.

# 결제(토스페이먼츠)·아카데미 패스: 결제위젯 결제창형, 테스트 키, 멱등 승인, 패스 수강 표시(AuditLog), 환불·회수

## WHY: 토스 "결제위젯 결제창형"(widgets + renderPaymentWindow)을 쓴다
- 공식 샘플의 API 개별 연동 테스트 키(test_ck_D5Ge…/test_sk_zXLk…)는 2026-10 기준 `UNAUTHORIZED_KEY`. 문서용 결제위젯 키 `test_gck_docs_…`/`test_gsk_docs_…` 만 살아 있어 위젯 결제창형으로 연동했다. 승인·취소 API(v1)는 같다.
- 키는 `packages/services/src/order/toss.ts` 에서 읽는다: TOSS_CLIENT_KEY(또는 NEXT_PUBLIC_…)·TOSS_SECRET_KEY. 개발에서는 env 가 없으면 문서 테스트 키로 대체하고, production 에서는 없으면 결제·환불을 막는다. 클라이언트 키도 서버에서 런타임에 읽어 props 로 넘긴다(Docker 빌드 시점에 NEXT_PUBLIC 이 비어도 됨).
- 운영 전환: 개발자센터 결제위젯 연동 키 live_gck_/live_gsk_ + 위젯 variantKey(DEFAULT/AGREEMENT) 확인.

## 결제 흐름·멱등
- /checkout 에서 "결제하기" → POST /api/v1/checkout 이 서버 가격으로 PENDING 주문 생성(같은 상품의 이전 PENDING 은 CANCELLED) → orderNo 가 토스 orderId.
- successUrl 서버 페이지가 금액 검증 → 승인 API(Idempotency-Key `confirm-<orderNo>`) → 트랜잭션에서 `updateMany(status PENDING→CONFIRMED)` 가 성공한 쪽만 지급. 동시 2회 승인도 1회만 지급(확인함). 승인 뒤 주문이 이미 취소돼 있으면 결제를 자동 취소.
- 지급 내역은 AuditLog `order.paid` detail(enrollmentsCreated/Converted, subscriptionId, receiptUrl)에 남기고, 전액 환불 때 이걸 읽어 **그 주문이 만든 Enrollment 만** 지운다(Enrollment 에 주문 연결 컬럼이 없어서).
- 갱신: 같은 요금제가 남아 있으면 새 Subscription 의 endsAt = 기존 endsAt + 기간(startsAt 은 결제 시각).

## 패스 수강 = AuditLog 로 표시 (스키마에 Enrollment.source 없음)
- "패스로 수강" 하면 Enrollment 생성 + AuditLog `enrollment.pass`(target `Enrollment:<id>`). 패스 수강 중 구매하면 `enrollment.purchase`. 가장 최근 기록이 pass 면 패스 수강.
- 패스 수강은 유효한 구독(canceledAt null, startsAt≤now<endsAt)의 plan.includes 에 강의 productType 이 있어야만 유효 — `PaymentService.enrollmentActive`. resolveCourseAccess(상세·강의실)·getLectureEnrollment(진도·퀴즈 API)·enrollments API 가 모두 이걸 쓴다. 만료·환불되면 잠기고 진도는 남는다(`passLapsed`).
- 무료 강의(price 0)는 출처와 무관하게 유효. 노출 규칙(INTERNAL)은 그대로.

## 환불
- 학습자 요청 = AuditLog `order.refund_request`(반려 `order.refund_reject`). 상태는 주문별 마지막 기록으로 판정.
- 어드민 환불 = 토스 cancel(cancelAmount, Idempotency-Key `cancel-<id>-<누적>-<금액>`) → refundAmount 누적. 누적이 총액이면 REFUNDED + 수강권 회수(Enrollment 삭제·Subscription.canceledAt), 아니면 CONFIRMED 유지(부분 환불).
- 환불 규정 Page(slug refund)는 어드민 문서 관리로 만들었다(평생교육법 시행령 별표3 원격교육 기준 문구 — 고객사 법무 검토 필요). 아카데미 /refund·푸터·결제 동의 링크는 문서가 있을 때만 보인다.

## 함정
- 토스 샌드박스 카드사 창(KB Pay 등)·토스페이는 실제 본인 인증(휴대폰·주민번호)을 요구해 자동화로 승인까지 못 간다. 검증은 결제창 열기까지 실브라우저 + 승인/취소 API 실호출(가짜 paymentKey → NOT_FOUND 응답으로 인증·형식 확인) + 토스 응답만 스텁한 하네스로 지급·환불 로직을 실 DB 에서 돌렸다.
- 체크아웃 동의 체크박스는 하이드레이션 전에 체크하면 풀린다 — Playwright 는 체크 상태를 확인하고 재시도할 것.
- 결제 대기 주문은 결제창에서 이탈하면 남는다 → 다음 체크아웃이나 failUrl(orderId 있을 때)에서 CANCELLED 로 정리. 구매자가 창을 닫으면(PAY_PROCESS_CANCELED) orderId 가 안 온다.

# 계정·메일: 메일러(SMTP_URL·mailpit), 비밀번호 재설정 토큰, 세션 무효(passwordChangedAt), 이메일 인증 배너, 소셜 로그인, 로그인 제한

## 메일러 (`@bayada/services/account` — 서버 전용, nodemailer)
- `SMTP_URL`·`MAIL_FROM`. 개발에서 없으면 발송 대신 서버 로그에 수신자·제목·링크 출력, production 에서 없으면 `MailerNotConfiguredError`. 로컬 수신함: `deploy/docker-compose.yml` 의 mailpit(1025/8025)만 띄우고 `.env.local` 에 `SMTP_URL=smtp://localhost:1025`.
- services 의 `"./account"` 별도 export 로 둔 이유: nodemailer·node:crypto 가 `@bayada/services` index 를 쓰는 모든 곳에 끌려오지 않게. **클라이언트 컴포넌트에서 import 금지** — 화면과 공용인 비밀번호 규칙은 `@bayada/shared/password-policy` 로 뺐다(academy signup-policy 는 재export).
- 부가 메일(초대·갱신)은 `trySendMail`(실패해도 본 동작 진행), 메일이 곧 기능인 재설정은 `sendMail`.
- 메일 링크 주소는 요청 Host 가 아니라 설정값: academy `lib/app-url.ts` = AUTH_URL → NEXTAUTH_URL → SITE_URL (로컬 SITE_URL 은 3000 이라 뒤로 뺌), admin = AUTH_URL → NEXTAUTH_URL. Host 헤더로 만들면 조작된 요청으로 남의 재설정 링크를 공격자 도메인으로 보낼 수 있다.

## 비밀번호 재설정·세션 무효
- AuthToken: 원문은 메일에만, DB 는 sha256. 30분·1회용. 소비는 `updateMany(usedAt null, 미만료)` count=1 로 이중 사용 방지, 성공 시 같은 계정의 다른 재설정 토큰도 소비 + LoginAttempt 삭제(잠금 해제) + emailVerifiedAt 채움(메일 링크 = 소유 확인).
- 재설정 화면(GET)은 토큰을 소비하지 않는다(메일 보안 스캐너 선열람 대비). 이메일 인증 링크는 반대로 GET 에서 바로 인증(누가 열어도 결과 동일).
- 요청 응답은 이메일 존재·승인 여부·과다 요청(15분 3통) 관계없이 항상 `{ok:true}`.
- 세션 무효: shared auth jwt 콜백이 로그인 시 `token.authTime` 을 넣고, 이후 **매 auth() 호출마다** `getSessionState`(DB 1쿼리)로 `passwordChangedAt > authTime` 이면 null 반환 → Auth.js 가 쿠키 삭제. authTime 없는 옛 토큰은 0 으로 본다. 계정이 지워져도 무효. 아카데미·어드민이 같은 User 라 어느 쪽에서 재설정해도 양쪽 세션이 끊긴다(확인함).
- WP 해시 재저장(updatePassword)은 passwordChangedAt 을 건드리지 않는다(같은 비밀번호라 세션을 끊으면 안 됨).

## 로그인 실패 제한
- 이메일+IP 15분 5회 실패면 `LoginRateLimited`(CredentialsSignin, code `rate_limited`) — 잠긴 동안은 비밀번호를 확인하지 않아 맞는 비밀번호도 거부. 없는 이메일도 실패로 센다(계정 존재 노출 방지). 잠긴 시도는 기록하지 않아 15분이 지나면 풀린다. 성공 시 그 이메일+IP 기록 삭제, 하루 지난 행은 실패 기록 때 정리.
- IP 는 x-forwarded-for 첫 값 → x-real-ip → "unknown". 프록시 없이 직접 노출하면 XFF 를 위조해 IP 를 바꿔 가며 시도할 수 있다 — 운영은 LB/리버스 프록시가 XFF 를 덮어쓰게 둘 것.

## 이메일 인증 (선택, 로그인 안 막음)
- 배너 대상 = 미인증 && legacyWpId 없음 && 기관 소속 없음 && STUDENT && 자리표시 이메일 아님. 이관 회원·기관 계정은 인증 기록이 원래 없어 조건 없이 띄우면 전원에게 뜬다. 위치는 마이 러닝(/dashboard) 상단 — 헤더는 다른 작업 영역이라 피함.
- 가입 API 가 인증 메일 발송(실패해도 가입 성공). 재발송 1분 쿨다운(마지막 EMAIL_VERIFY 토큰 createdAt 기준).

## 소셜 로그인 (카카오·구글, 아카데미만)
- `AUTH_KAKAO_ID/SECRET`·`AUTH_GOOGLE_ID/SECRET` 있는 제공자만 provider 등록 + 버튼 노출(login page 서버 컴포넌트가 판단해 LoginForm 에 넘김). 어드민엔 없음.
- signIn 콜백에서 연결/생성(`lib/social-auth.ts`): 기존 SocialAccount → **제공자가 확인했다고 보증한 이메일**(구글 email_verified, 카카오 is_email_valid && is_email_verified)이 같은 기존 계정에 연결 → 새 STUDENT(APPROVED). 미확인 이메일이 이미 가입돼 있으면 거부(`?error=SocialEmailInUse`, 계정 탈취 방지). 이메일 없거나 미확인이면 `provider-id@social.bayada.invalid` 자리표시 — 메일러가 `.invalid` 는 건너뛴다.
- jwt 콜백: 소셜 직후 user.id 는 제공자 id 라 SocialAccount 로 우리 User 를 찾아 넣는다. 첫 로그인 직군은 `redirectTo=/[locale]/auth/onboarding?callbackUrl=…` 이 jobRole 없을 때만 묻는다.
- 실제 카카오/구글 OAuth 왕복은 키가 없어 미검증(버튼 숨김·온보딩 화면·연결 로직 코드 경로까지만).

## 초대·갱신 메일
- 기관 초대 API 가 초대마다 메일 발송, 응답 `emailed` 로 성공한 주소만 — 링크 복사 UI 는 그대로(메일 실패 대비).
- 인증 갱신 메일은 화면 배너(renewalNotifiedAt)와 별개로 `POST /api/cron/credential-renewals`(Bearer CRON_SECRET, 개발은 없으면 허용) 를 하루 한 번 외부 스케줄러가 호출. 인증마다 1회(`renewalEmailedAt` 선점 후 발송, 실패 시 되돌림). 스케줄러는 아직 어디에도 등록돼 있지 않다 — 운영 전환 때 cron 등록 필요.

# 어드민 동적 역할·권한(AdminRoleDef)·사이트 설정(SiteSetting): ADMIN 잠금, 사용자 정의 역할=STUDENT+customRoleKey, 파트너 콘솔 고정, 섹션별 설정 행

## WHY: 권한은 코드 목록 + DB 역할 행
- 권한 키·한국어 이름·설명은 코드(`apps/admin/src/lib/rbac.ts` PERMISSION_DEFS) — 기능이 코드에 있으니 권한 종류도 코드가 정한다. 역할별 보유 권한만 DB `AdminRoleDef.permissions`. 새 권한을 추가하면 ADMIN 은 자동으로 갖고, 다른 역할은 역할·권한 화면에서 체크해야 생긴다(기존 행은 시드가 덮지 않음).
- 시스템 역할 4개(ADMIN·CONTENT_MANAGER·CLINICAL_REVIEWER·PARTNER_ADMIN)는 행이 없으면 `ensureSystemRoles()`(createMany skipDuplicates)가 옛 MATRIX 값으로 만든다 — 첫 조회 때 자동 + `pnpm --filter ./apps/admin seed:roles`. STUDENT·ORG_ADMIN 은 아카데미 역할이라 매트릭스에 없다(넣으면 학습자 전원이 어드민에 들어올 수 있게 됨).
- 권한 판정은 항상 `can(user, perm)`(AdminUser.permissions). `user.role` 은 파트너 소유권 등 역할 고유 규칙에만 쓴다. 워크플로우 전이도 역할이 아니라 권한(workflow.operate / workflow.clinical / PROGRAM_EDIT) 기준으로 바꿨다. "임상만 보는 큐" = workflow.clinical 있고 workflow.operate 없음.
- 캐시: React cache(요청당 1회)만. 프로세스 메모리 캐시는 두지 않았다(인스턴스 여러 개면 저장 후 옛 권한 유지). 저장 시 revalidatePath 레이아웃.

## 잠금·함정
- ADMIN 은 DB 값과 무관하게 `effectivePermissions` 가 항상 전체 권한(열 잠금). 마지막 승인된 Super Admin(customRoleKey 없음)은 역할 변경·가입 거절 불가. Super Admin 지정·해제는 Super Admin 만(회원 관리 권한으로 최고 권한을 넘기지 못하게). 본인 역할에서 role.manage 를 빼는 저장도 거부.
- `partner.console` 은 PARTNER_ADMIN 전용 고정(FIXED_PERMISSIONS). guards.ts 소유권 검사가 `role === "PARTNER_ADMIN"` 기준이라 다른 역할에 주면 남의 기관 프로그램을 고칠 수 있게 된다.
- 사용자 정의 역할 사용자 = `role=STUDENT` + `customRoleKey`. 아카데미에선 평범한 학습자. 기관 관리자 지정·파트너 지정 화면은 customRoleKey 있는 계정을 거부한다(안 막으면 role 만 바뀌고 어드민 권한은 그대로 남음). 회원 역할 필터: 시스템 역할 선택 시 customRoleKey null 조건 추가.
- 권한이 0개인 역할·삭제된 역할 사용자는 signIn 거부 + getAdminUser null(갈 첫 화면이 없어 리다이렉트 루프가 남). 첫 화면은 `homePath(user)` 가 권한 순서로 고른다.
- 역할 삭제는 지정 회원 0명일 때만. 권한 저장은 화면을 연 시점 값(base)과 DB 를 비교해 동시 수정 거부. AuditLog `role.permissions`(before/after/added/removed), `role.create|update|delete`.

## 사이트 설정 (SiteSetting: 섹션별 key 한 행)
- 타입·기본값·정규화는 `@bayada/shared/site-settings`(순수). 기본값 = 옛 하드코딩 문구라 행이 없으면 화면이 그대로. '기본값으로' = 행 삭제. 섹션별 행인 이유: 동시 편집 시 다른 섹션을 덮지 않음, 감사 로그가 섹션 단위, 필드 추가 시 마이그레이션 불필요.
- 아카데미 홈·헤더·푸터는 로그인 쿠키를 읽는 동적 렌더링이라 요청마다 `getSiteSettings()`(React cache) — revalidate 엔드포인트 불필요. DB 실패 시 기본값(빌드 정적 생성 대비).
- 링크 값: `/…` 는 언어 경로 아래, `#…` 홈 안 위치, https·mailto·tel 만 허용(javascript: 거부 — 저장 시 에러로 알림, 정규화는 조용히 비움).
- 홈 섹션을 숨기면 헤더 '기관·센터'(#org=업셀)·'자주 묻는 질문'(#faq) 바로가기와 푸터 FAQ 링크도 숨긴다. FAQ 항목 0개면 섹션 자체 숨김.
- OG 이미지 URL: file-based `opengraph-image.tsx` 가 config 메타데이터보다 우선이라 metadata.openGraph.images 로는 안 바뀐다 → opengraph-image 가 설정 URL 을 받아 그대로 내려준다(force-dynamic, 실패 시 생성 이미지). 그리고 원래 i18n 미들웨어가 `/opengraph-image` 를 `/ko/…` 로 보내 404 였다 → matcher 에서 제외. og:image:type 은 png 로 고정 표기(설정 이미지가 jpg 여도).
- 검증(2026-10-29): Playwright 로 CM 후기 관리 끄기→메뉴·페이지 차단, 사용자 정의 역할(2권한) 지정→사이드바 2개·첫 화면 /programs, 커스텀 역할에 회원 관리 줘도 Super Admin 승격 거부, 히어로·FAQ·SEO 제목 수정→아카데미 반영 후 전부 원복·테스트 계정 삭제.
- 함정(이 PC): Git Bash 의 python heredoc 에서 `"\n"`·`"\r"` 이 실제 개행/CR 로 들어갔다 — 백슬래시가 있는 코드는 Edit/Write 도구로 고칠 것. HeaderNav·SiteHeader 는 CRLF 파일.

# 웹사이트(apps/web) 어드민 통합: 작업 영역 전환, 문의 CRM(WebInquiry), 콘텐츠 DB+폴백, ISR·/api/revalidate
## 구조·WHY
- 어드민 하나가 아카데미·웹사이트를 같이 관리. 사이드바 "아카데미 | 웹사이트" 전환은 **URL 로만** 정한다(`/[locale]/web/…` = 웹사이트). 상태·쿠키 없음. 한쪽 권한만 있으면 전환 버튼 없이 그쪽만.
- 권한 `web.inquiries`(문의 CRM)·`web.content`(블로그·FAQ·후기·히어로)·`web.settings`(사이트 정보·알림 메일). ADMIN 자동 보유, 기존 역할 행은 역할·권한 화면에서 체크해야 생긴다.
- 공용 정의(폼 종류·접두어·필수 필드·라벨·사이트 정보 기본값)는 `@bayada/shared/web-content`(순수). 사이트 정보는 아카데미와 같은 SiteSetting 테이블에 `web.site` / `web.inquiry` key.
## 문의 접수 (apps/web `lib/inquiry.ts` 서버 액션 — 옛 lib/mock.ts 대체)
- 접수번호 `접두어-YYYYMMDD(KST)-NNN`(접두어는 옛 mock prefixMap 그대로 + DC=DeiCloud). 같은 날·접두어 안 일련번호, unique 충돌 시 재시도.
- 허니팟 `website` 필드에 값이 있으면 **저장 없이 성공처럼** 응답(-000 번호). 같은 IP(sha256 해시만 저장) 10분 5건 제한. 필수 필드·동의는 서버에서 다시 검사(WEB_FORM_REQUIRED·WEB_FORM_CONSENT_REQUIRED).
- 알림 메일: 어드민 '사이트 정보'의 알림 주소로 `trySendMail`(SMTP 없으면 개발은 로그, 실패해도 접수는 성공). 메일 속 어드민 링크는 web 의 `ADMIN_PUBLIC_URL` 이 있을 때만.
- 처리 이력은 WebInquiryNote(kind memo/status/assignee) + AuditLog `web.inquiry.*`. 삭제는 개인정보 파기용(이력까지 cascade).
## 콘텐츠 읽기·폴백 (apps/web `lib/web-content.ts`)
- DATABASE_URL 없음 / DB 오류 / 테이블 0행이면 `src/data/*` 하드코딩 값. 도커 빌드는 DB 없이 이 경로로 정적 생성되고, 실행 후 ISR(revalidate 300) 또는 어드민 저장 시 갱신. DB 오류 한 번 나면 30초간 DB 를 건너뛴다(빌드 타임아웃 누적 방지).
- 히어로는 **보이는 슬라이드 0장**이면 기본 슬라이드(빈 히어로 방지). 후기는 숨김 포함 0행일 때만 폴백(전부 숨김 ≠ 가져오기 전).
- 어드민 저장 → `revalidateWeb()` 가 `WEB_URL/api/revalidate`(헤더 x-revalidate-secret=WEB_REVALIDATE_SECRET) → `revalidatePath("/", "layout")`. 둘 중 하나라도 없으면 건너뜀(최대 5분 지연). 로컬 web 은 3000 이 이 PC 에서 막혀 있어(EADDRINUSE) **3001**, admin `.env.local` WEB_URL=http://localhost:3001.
- `import:web` 은 없는 행만 만든다(slug·legacyKey). 어드민에서 **지운** 기본 항목은 다시 돌리면 되살아난다 → 지우지 말고 숨김. 블로그 기본 image 는 실제 파일이 없는 자리표시 경로라 비워서 넣는다.
- FAQ 페이지는 원래 searchParams 를 써서 동적 렌더(매 요청 DB). 블로그·후기·홈·레이아웃(푸터)은 ISR.
## 운영 반영 순서
- 스키마 push(추가만) → `DATABASE_URL=… pnpm --filter @bayada/db import:web` → `.env` 에 WEB_REVALIDATE_SECRET 추가 → `up -d --build web admin`.
## 다음 단계 (이번 범위 밖)
- `data/service-page-details.ts`·`audiences.ts`·`platforms.ts`(서비스·대상·플랫폼 상세 문구)는 아직 하드코딩. 사이트 정보 설정은 푸터·문의 페이지 카드만 바꾼다 — 본문 문구 속 대표번호(1670-1379)는 FAQ·약관·기관 페이지 등 여러 곳에 하드코딩으로 남아 있음.

# 클라이언트 리뷰·피드백 도구: review-access 잠금, 힌트 쿠키 + 세션 API, site 스코프, 어드민 /feedback

## 구조 (2026-11-09, 원본 review-tools-portable 이식 — Supabase → Prisma)
- `packages/review` = 서버 로직(config 순수 모듈 / access 서명 쿠키 / server 라우트 팩토리). web·academy 의 `app/api/review/{feedback,replies,session}` 은 사이트 키만 넘겨 export.
- `packages/review-ui` = 사이트에 뜨는 도구(요소 검사·VIEW MODE·런처 5종 부채꼴·마커·목록·댓글·상태). 루트 레이아웃의 `<ReviewGate site>` 하나로 붙는다.
- DB: `ReviewFeedback`/`ReviewFeedbackReply` 한 쌍을 두 사이트가 같이 쓴다 → **모든 쿼리에 site 조건 필수**. section(언어 경로 다음 첫 세그먼트, 홈=home)은 저장 시 계산해 둔다(필터·현황용).

## WHY: 루트 레이아웃에서 cookies() 를 읽지 않는다
- 웹사이트는 정적 렌더링이라 루트에서 cookies() 를 읽으면 전 페이지가 동적으로 바뀐다. 그래서 잠금 해제 시 httpOnly 서명 쿠키(`bayada_review_<site>`)와 JS 가 읽는 힌트 쿠키(`bayada_review_ui_<site>`)를 같이 굽고,
  게이트는 힌트가 있을 때만 `GET /api/review/session`(서버가 서명 검증) → unlocked 면 `next/dynamic` 으로 도구 JS·CSS·글꼴을 불러온다. 힌트는 권한이 아니다(API 가 매번 서명 쿠키를 검사).
- 일반 방문자는 도구 코드·CSS 를 아예 받지 않는다. CSS 도 토큰을 `.foundation-theme`(도구 루트) 안에만 두고 글꼴 이름을 "Review Figtree/Pretendard" 로 바꿔 사이트와 안 겹치게 했다.
- 서명에 사이트 키가 들어가 웹 쿠키로 아카데미 API 를 못 쓴다. REVIEW_ACCESS_PASSWORD·SECRET 둘 중 하나라도 없으면 도구·API 전부 꺼짐(503).

## 함정
- `/review-access` 는 언어 경로 밖 → web·academy middleware matcher 에서 제외해 둠. 다시 matcher 를 고칠 때 빠뜨리면 /ko/review-access 로 가서 404.
- 작성자 = 소속(바야다 client / 제작팀 agency) + 이름 직접 입력, 브라우저 localStorage 에 기억. 계정 인증이 아니다. 수정은 작성 브라우저 토큰(sha256 만 DB) + 같은 소속·이름 + 미처리 상태일 때만.
- 사이트 도구의 상태 전환은 `manualFeedbackTransitions` 만 허용(배포완료는 어드민 전용). 어드민은 모든 상태로 변경 가능 + 재수정 요청(개발완료 이후만 → 미처리 + 사유).
- 어드민 댓글은 department="admin" → 사이트 카드에 "이름 · 관리자". "위치 보기"는 WEB_PUBLIC_URL(없으면 WEB_URL) / ACADEMY_URL — 운영 admin 의 WEB_URL 은 웹사이트 재생성용 내부 주소(http://web:3000)라 공개 주소를 따로 둔다 + `#feedback=<selector>&text=…&review=<id>&scope=page` — 리뷰 모드가 켜진 브라우저에서만 요소를 찾아 강조한다.
- 원본의 페이지별 selector 이전 규칙·배포 검증(deployment)·담당자 고정 명단은 다른 사이트 전용이라 옮기지 않았다.
- 로컬 검증 DB 는 `bayada_review`(5433). 어드민 권한 코드는 `feedback`(ADMIN 은 자동 포함, 다른 역할은 역할·권한 화면에서 부여).

# 어드민 디자인 시스템(콘솔): components/ui 키트, 네이티브 컨트롤 금지, --chip-bg 면 규칙, 스타일 가이드 /style-guide
## WHY: 어드민은 @bayada/ui 가 아니라 자체 조각 (2026-11-09 재디자인, Boxon 어드민 품질 기준)
- 고객 피드백 "관리자 스타일이 허접" → Boxon 어드민 구조(검정 사이드바·묶음 제목·알약 메뉴, 따뜻한 회색 바탕, 테두리 없는 흰 카드 22px, 알약 버튼, 채운 KPI 카드)를 BAYADA 레드로 옮김. Boxon 노랑·로고는 쓰지 않음.
- 옛 어댑터(`components/ui` → @bayada/ui)는 학습자용 모양이라 어드민을 바꾸면 아카데미·웹도 바뀐다 → 어드민 모양은 `apps/admin/src/components/ui/index.tsx` + `ui/kit/*` 에서 직접 그린다. @bayada/ui 에서는 `cn` 만 쓴다. 토큰만 공용: theme.css 의 "어드민 콘솔 전용 토큰" 블록(console·wash·hairline·side·kpi-*·pill-*).
- DESIGN-SYSTEM.md §7 "검정 채운 버튼 금지"는 학습자 화면 규칙. 어드민은 primary=잉크 알약, brand=레드 알약(화면당 1개·결정적 행동), 레드는 현재 메뉴 알약·핵심 KPI·선택 표시.
## 규칙 (새 화면 만들 때)
- 네이티브 UI 금지: `<select>`→Select(optgroup 은 option.group) · checkbox→Checkbox/ToggleChip · radio→Radio/Segmented · date/datetime-local→DatePicker(mode="datetime", 값 형식 네이티브와 동일) · number→NumberInput(스피너 숨김+−/+) · file→FileDrop · `<details>`→Disclosure · `<dialog>`/confirm/alert→Dialog·useFeedback().confirm/toast · `title=` 툴팁→`data-tip`(TooltipLayer)·`<Tooltip>`(비활성 버튼은 감싸야 이벤트를 받음; Button 의 title prop 은 자동 변환).
- 폼 값: 커스텀 컨트롤에 name 을 주면 숨은 input 으로 FormData 에 실린다. required 면 화면 밖 텍스트 input(data-proxy-for)이 제약 검증에 참여 → FormGuard 가 invalid 이벤트를 가로채 디자인된 말풍선. 브라우저 검증 말풍선이 안 뜨는 이유가 이것.
- FeedbackProvider 는 루트 레이아웃(로그인 화면 포함)에 있고 TooltipLayer·FormGuard 를 같이 띄운다.
- 면 규칙: 필터 알약·검색칸(sm)·secondary 버튼·흰 Stat 은 `bg-(--chip-bg)` — 콘솔 바탕 위 흰색, `.surface-card`(Card·tableWrap·Dialog·Popover) 안 wash. 카드 안 인라인 편집 패널은 `.panel-inset`(패널 회색, 안의 입력 흰색). 새 흰 면을 만들면 surface-card 를 붙여야 버튼·칩이 안 사라진다.
- 표: tableWrap(흰 카드) + th 는 wash 알약 띠, td 기본 nowrap(긴 글은 `whitespace-normal!`), 첫 열 링크는 font-bold. 폼 하단 저장 줄은 `actionBarClass`(떠 있는 흰 알약, sticky).
- 스타일 가이드 `/[locale]/style-guide`(Super Admin=roleKey ADMIN 만, 사이드바 시스템 묶음). 새 조각을 만들면 여기에도 상태를 추가.
## 함정
- 이 PC Git Bash 에서 Playwright 스크립트에 `/programs` 같은 인자를 주면 `C:/Program Files/Git/programs` 로 바뀐다 → `MSYS_NO_PATHCONV=1`. Playwright 는 boxon 레포 node_modules + ms-playwright chromium-1248 실행 파일로 돌렸다.
- 피드백 테이블(ReviewFeedback)은 bayada_v2 에 없고 bayada_review 에만 있다(2026-11-09). 피드백 화면 확인은 `DATABASE_URL=…/bayada_review pnpm dev`(프로세스 env 가 .env.local 보다 우선). bayada_review 는 이때 db push 로 WebInquiry 등 최신 스키마를 맞춤.
- Python 으로 파일을 쓸 때 `newline=''` 를 안 주면 윈도우에서 CRLF 로 바뀐다.

# 어드민 셸·도움말: 사이드바 접기(쿠키)·서랍, 화면 둘러보기(data-tour), 운영 매뉴얼 /manual
## 구조 (2026-11-09)
- `(dashboard)/layout.tsx` → `components/AdminShell.tsx`(클라이언트) = HelpProvider + 사이드바 + 본문. 접힘 상태는 쿠키 `bayada-admin.sidebar`(rail|full)를 **서버 레이아웃이 읽어** 첫 렌더부터 72px — localStorage 로 하면 수화 전 256px 로 깜빡인다. 쿠키 이름은 순수 모듈 `lib/sidebar-pref.ts`("use client" 모듈의 상수를 서버에서 import 하면 문자열이 아니라 클라이언트 참조가 된다).
- 1024px 미만은 서랍(상단 바 ≡). 서버·첫 렌더는 데스크톱 가정이라 데스크톱 사이드바에 `hidden lg:flex` — 휴대폰에서 수화 전 사이드바가 보이지 않게. Ctrl/⌘+B 는 입력칸·편집기 포커스 중엔 가로채지 않음.
- 접힌 아이콘 툴팁은 TooltipLayer 확장: `data-tip-side="right"`, `data-tip-kbd="Ctrl B"`. pointermove 로도 다시 띄운다(접을 때 사이드바 스크롤이 바뀌어 scroll→hide 뒤 pointerover 가 다시 안 오던 문제).
## 둘러보기·매뉴얼 규칙
- 내용 원본은 `components/help/tours.ts`(화면별 단계, match=언어 경로 뗀 경로) · `manual.ts`(글, paths 로 도움말 패널 연결). 화면·버튼 이름을 바꾸면 둘 다 고칠 것. 대상은 `data-tour` — PageHeader 는 자동으로 `page-header`/`page-actions`, Card 는 `tour` prop.
- 권한·상태 때문에 안 그려진 대상 단계는 시작 시 건너뜀(보이는지까지 검사: 숨은 서랍·display none 제외). "a|b" = 둘 중 보이는 쪽(사이드바 도움말 | 상단 바 도움말).
- 처음 안내(welcome)는 localStorage `bayada-admin.tour.<userId>`="done" — 브라우저별(서버 기록 아님). 사용자가 700ms 안에 도움말을 먼저 열면 자동 시작 생략(열어 둔 패널을 닫던 경쟁 상태).
- 둘러보기 스크롤은 scrollIntoView 금지(페이지까지 굴러감) → 가장 가까운 스크롤 상자만 굴리고 끝나면 원위치.
- 검증 스크립트(Playwright, 임시 폴더)는 `button:has-text("완료")` 처럼 넓게 잡으면 페이지의 "처리 완료"·"개발완료" 칩을 누른다 → 둘러보기 대화상자 안으로 한정.

# 프로그램 자동 표지(Course.coverMode AUTO/UPLOAD): @bayada/ui/cover, 분야 색, OG /api/cover, 어드민 미리보기
## WHY (2026-11-09)
- 이관된 WP 썸네일은 작은 로고·작은 글씨 배너라 카드에서 안 읽힘 → `Course.coverMode` enum(AUTO 기본 | UPLOAD) 추가(additive db push). 기존 64개 전부 AUTO. thumbnail 값은 지우지 않았다(UPLOAD 로 바꾸면 그대로 쓰임).
- 표지 규칙은 `packages/ui/src/cover` 한 곳: 색 = 카테고리 slug(`CATEGORY_TONE` 표, 없으면 해시), 무늬 = 코스 slug 해시. 라벨 문자열은 앱이 넘긴다(아카데미 `lib/cover.ts` coverInput, 어드민 ProgramForm CoverPreview). 별도 진입점 `@bayada/ui/cover` 인 이유: 루트 index 는 "use client" 모듈이 섞여 라우트 핸들러(OG)·서버에서 쓰기 애매.
- 이미지가 들어가는 곳은 전부 `components/course/CourseMedia`(카드·상세·마이 러닝·홈 순위·결제). UPLOAD 인데 이미지가 깨지면 자동 표지로 대체(CourseThumb onError + 마운트 시 naturalWidth 검사).
## 함정
- 표지 글자 크기는 cqw — cq 단위는 "조상" 컨테이너 기준이라 container-type 을 바깥 div 에 둔다(자기 자신에 두면 안 먹음).
- OG `/api/cover/[slug]`: 게시+PUBLIC 만(사내 전용 제목 유출 방지 → 404). satori 는 woff2·한글 기본 글꼴이 없어 Pretendard Bold otf 를 jsdelivr **npm** 경로에서 받아 메모리 캐시(gh 경로는 403/404). 서버에 인터넷이 없으면 한글이 빠진다. satori 는 SVG preserveAspectRatio slice 를 무시 → 무늬를 1200×675 로 그려 맞춤.
- 어드민 Program 저장: UPLOAD 인데 URL 없으면 거부. 파트너 콘솔도 같은 폼.

# 아카데미 학습자 UI v5: 네이티브 컨트롤 금지, 알약 키트, 빈 상태(외부 회원 0개), 강의실·플레이어, 검증 방법
## 규칙
- 학습자 화면도 네이티브 select/checkbox/radio/date/confirm/alert 금지 → `@bayada/ui` Select·Checkbox·CheckVisual·DatePicker·Sheet·useFeedback. 예외: sr-only 로 숨긴 네이티브 입력 + 디자인된 모양(폼 검증 유지용)은 허용. `@bayada/ui` 컴포넌트는 academy 만 쓴다(web·admin 은 cn 만) — 바꿔도 웹사이트 화면은 안 바뀜. theme.css 토큰은 web 도 읽으니 기존 값은 건드리지 말 것. 애니메이션 키프레임은 academy globals.css @theme 에만.
- form.tsx(서버 안전: controlClass 등)와 choice.tsx("use client": Checkbox 등)를 나눈 이유: "use client" 모듈의 함수(controlClass)를 서버 컴포넌트가 부르면 클라이언트 참조라 깨진다.
- 게시 프로그램이 0개면 홈·카탈로그에 `NoProgramsNotice`(2026-11-09 부터 INTERNAL 도 둘러보기에 포함되므로 49개 INTERNAL 이어도 안 뜬다)(이유 + 임직원 로그인/기관 도입 문의/바야다 인증). 판단은 `getFacetCounts().total === 0`. 공개 여부는 고객사 엑셀로 결정 예정 — 데이터 손대지 말 것.
- 강의실: 영상은 끝까지 보면 자동 완료(onEnded), 5초마다 watchedSec 저장 → 다음 진입 시 이어보기(끝 10초 전까지만). 전체 화면은 컨테이너 요소(커스텀 컨트롤 유지), 속도 메뉴는 포털이 아니라 플레이어 안(전체 화면에서도 보이게).
## 검증 방법 (2026-11-09)
- 공개 전환 후 동작 확인은 DB 사본으로: `pg_dump bayada_v2 | psql bayada_v2_pubtest` → 사본에서만 visibility=PUBLIC → dev 를 `DATABASE_URL=…/bayada_v2_pubtest pnpm dev` 로 띄워 외부 회원 수강→영상→퀴즈→수료증 확인 후 사본 삭제. 실데이터 visibility 는 그대로.
- demo.student@bayada.local 은 원래 Docker 운영 DB(5435)에만 있었다 → bayada_v2 에는 가입 화면으로 새로 만듦(외부 회원, 조직 없음).
- b-academy 는 게시 강의 49개 전부 수강 중이라 "수강 신청" 흐름은 외부 회원+사본 DB 로만 볼 수 있다.
- 모바일 가로 넘침: grid 에 열 지정이 없으면 overflow-x-auto 자식의 내용 폭만큼 열이 커진다 → `grid-cols-[minmax(0,1fr)]`.


# 홈페이지 회원·마이페이지(apps/web): 같은 User 계정, bayada-web 쿠키, 회원 유형·방문 인력, 예약 상태 전이, 가족 연결, 문의 연결, 어드민 web.members/web.bookings
## 구조·WHY (2026-11-09)
- 시니어 플랫폼 1차 = 홈페이지 `/[locale]/my-page`. 계정은 아카데미와 같은 User (role STUDENT) — 웹 가입 계정으로 아카데미 로그인되고 반대도 된다. 회원 유형은 `WebMemberProfile`(userId PK). 프로필 없는 계정(아카데미·소셜 가입)은 마이페이지 첫 진입 시 `/my-page/onboarding` 에서 유형만 고른다. 명세의 Patient 모델은 안 만들었다(서비스 이용자 User = 환자). 차이점은 functional-spec/06 §10.
- web 인증 `apps/web/src/lib/auth.ts`: createAuthConfig + 쿠키 `bayada-web.*`(pkce/state/nonce 포함 — 소셜 왕복용). 운영 비밀값 `WEB_AUTH_SECRET`→AUTH_SECRET. 카카오·구글 로직은 `@bayada/shared/social-auth` 로 옮겨 아카데미와 공유(academy lib/social-auth.ts 는 재export). 웹 콜백 주소 `https://${WEB_HOST}/api/auth/callback/{kakao,google}` 를 콘솔에 따로 등록해야 한다.
- 정적 생성 유지: 레이아웃·헤더는 쿠키를 안 읽는다. 헤더 회원 메뉴(AccountMenu)는 Header 안의 SessionProvider → 브라우저가 /api/auth/session 조회. my-page·auth 레이아웃만 force-dynamic. DB 없이 `DATABASE_URL="" next build` 통과 확인.
- 공용 규칙 `@bayada/shared/member`(순수): 회원 유형 라벨, 예약 상태·시간대, 예약 가능 서비스(BOOKABLE_SERVICES ⊂ WEB_SERVICE_OPTIONS), 건강 수치 범위·이상 징후(명세 §3), 취소 가능 판정.
## 상태·권한 규칙
- 예약 `REQUESTED →(어드민 확정+담당자)→ CONFIRMED →(담당 제공자 방문 기록)→ COMPLETED`, 어디서든 `CANCELLED`. 회원: 변경은 REQUESTED 만, 취소는 REQUESTED 언제든 / CONFIRMED 는 방문 24시간 전까지(시간대 시작 KST). 전이는 전부 updateMany(where status) count=1. 진행 이력 BookingEvent — `internal=true`(어드민 메모)만 회원에게 숨김.
- 예약·기록 접근 = 본인 또는 승인된 FamilyLink 보호자(`canViewPatient`). 보호자는 연결된 가족 대신 예약 가능, 건강·복약은 열람만. 건강 기록·복약 입력은 SERVICE_USER 본인만.
- 방문 기록은 `isVisitStaff` 인 PROVIDER 이고 자기에게 배정된 CONFIRMED 예약, 방문일 ≤ 오늘(KST)일 때만. 저장하면 예약 COMPLETED + (활력징후 있으면) HealthRecord(STAFF). 수정 불가. 어드민 "방문 기록 없이 완료"는 만족도 평가가 열리지 않는다(평가는 visit 필수).
- 가족 연결: 보호자가 이용자 이메일/휴대폰(숫자만 비교, regexp_replace)으로 요청 → 결과와 무관하게 같은 안내(계정 존재 노출 방지). 승인 전에는 보호자 화면에 이용자 이름 대신 입력한 연락처만.
- 문의 연결: submitInquiry 가 auth() 로 userId 저장. '내 문의' = userId 또는 (이메일 인증된 경우만) userId null + 같은 이메일. 회원에게는 WebInquiryNote kind=status 만(메모·담당자 숨김).
- 어드민 권한 `web.bookings`(예약·방문 기록), `web.members`(회원 유형·방문 인력·탈퇴). 사이드바 배지 bookings=REQUESTED 수, withdrawals=처리 전 탈퇴 요청. 담당자 후보 = PROVIDER && isVisitStaff && 탈퇴 전. 확정 담당 중인 인력은 지정 해제 불가.
- 탈퇴 처리 = 건강·복약·가족 연결·소셜·토큰 삭제 + User 익명화(email `withdrawn-<id>@withdrawn.bayada.invalid`, REJECTED, passwordChangedAt=now) — 예약·방문 기록·아카데미 수료는 익명 계정에 남김. 진행 중 예약·어드민 역할이 있으면 거부. 감사 로그에 원래 이메일 안 남김.
## 함정·검증
- 비밀번호 변경(마이페이지)은 passwordChangedAt 을 갱신 → 현재 세션도 끊김 → 화면이 signOut 후 로그인으로 보낸다(의도).
- Header.tsx 는 LF(메모리의 CRLF 기록과 다름, 2026-11-09 확인).
- E2E 스크립트 `D:/dev/work/bayada-member-e2e/e2e.cjs`(boxon/boxon 의 playwright 1.57 + chromium-1248) — 가입→예약→어드민 확정→제공자 기록→평가·보호자 열람·문의 상태·아카데미 로그인까지 한 번에, 스크린샷 apps/web/.screens/member/. 로컬 어드민 계정 e2e-admin@bayada.test / E2eAdmin123 (bayada_v2 에만). 정리: 같은 폴더 cleanup.sql.
- dev 서버를 TaskStop 해도 node 자식이 포트를 잡고 남는다 → netstat 으로 PID 확인 후 Stop-Process.

# 아카데미 파운데이션(Figtree·Pretendard, 역할별 제목 type-page-title, --radius-button): academy 전용 덮어쓰기
## WHY (2026-11-09)
- 디자이너의 next-client 파운데이션(서체·타입 스케일·여백)을 아카데미에만 적용. 공용 `theme.css` 는 web·admin 도 읽으므로 값은 `apps/academy/src/app/academy-foundation.css` 에서 덮는다(globals.css 가 theme.css 다음에 import).
- 버튼 모양은 `--radius-button`(공용 :root 9999px, 아카데미 8px) — Button 컴포넌트에 8px 를 박으면 다른 앱 알약이 깨진다.
- PageHeader·SectionHeader 의 `data-component`/`data-size` 는 아카데미 CSS 가 제목 크기를 거는 훅. 지우면 아카데미 제목 위계가 풀린다.
## 함정
- 공용 `container-page`(lg)·`section-y`(md) 에 미디어쿼리가 있어, 아카데미 쪽 같은 이름 @utility 에 같은 중단점을 다시 쓰지 않으면 큰 화면에서 공용 값이 이긴다.
- next/font/local 경로는 layout.tsx 기준 `../../public/fonts/...`. PowerShell 로 저장하면 BOM·CRLF 가 붙으니 확인.
- 전 프로그램이 INTERNAL 이라 비로그인으로는 강의 상세 h1·강의실 제목을 못 본다(상세는 열람 제한 안내, 강의실은 로그인으로). 확인하려면 임직원 계정 또는 사본 DB.

# 영상 보호·진도 규칙: 서명 주소(MEDIA_SIGNING_SECRET, Caddy forward_auth), 앞으로 건너뛰기 금지, 95% 완료, 퀴즈 잠금
## WHY (2026-11-10 사용자 결정)
- 예전 WP 는 Cloudflare Stream(스트리밍)이라 수강생이 파일을 받기 어려웠다. 우리 mp4 는 관리자 쪽 백업(2026-10-28)이고, 미디어 서버가 주소만 알면 누구에게나 주던 상태였다 → 서명 주소로 막음. 쿠키 방식은 media.* 도메인에 쿠키가 안 가서 버렸다.
- 로그인 수강생이 자기 브라우저에서 저장하는 건 못 막는다(스트리밍·DRM 영역). 막는 건 '주소 공유'.
## 흐름
- 강의실 페이지가 접근 판정 뒤 `signMediaUrl()` 로 `?exp=&sig=`(HMAC-SHA256(path\nexp), 6시간) 를 붙인다. Caddy `{$MEDIA_HOST}` 의 `/videos/*` 는 `forward_auth academy:3000 /api/media/verify` → X-Forwarded-Uri 서명 확인(DB 조회 없음) → 204 면 파일, 403/410/503 그대로 반환. `/uploads/*` 는 공개 그대로.
- 만료되면 플레이어 '다시 시도'가 router.refresh 로 새 주소를 받아 같은 위치에서 이어 본다.
- 진도: `Progress.watchedSec` = 본 가장 먼 지점(이어보기 겸). 줄지 않고, 직전 기록 이후 경과 시간×2배속+5초까지만 늘어난다(요청 조작으로 끝 점프 불가). 영상 완료는 서버가 watchedSec ≥ 길이×0.95 일 때만(`watchedEnough`). 길이 없는 레슨 4개만 플레이어가 보낸 길이 사용. 영상 '완료로 표시' 버튼은 없앰(읽기는 그대로).
- 플레이어: 수강 중·미완료면 lockForward — 본 지점까지만 탐색(진행 바·10초 버튼·키보드·기본 컨트롤 seeking 모두 되돌림). 완료한 영상·미리보기는 자유 탐색.
- 퀴즈: 같은 프로그램에서 앞 레슨을 모두 완료해야 열림(페이지 잠금 화면 + 퀴즈 API 403). 이미 완료한 퀴즈는 예외.
## 함정
- Caddy 에서 `uri strip_prefix` 를 쓰면 rewrite 가 forward_auth 보다 먼저 돌아 서명 경로가 달라져 전부 403 → 경로를 고치지 말고 `root * /srv/media` 로 서빙(파일은 /srv/media/videos/<파일>).
- compose 는 MEDIA_SIGNING_SECRET 없으면 시작을 거부한다(`:?`). 로컬은 비밀값이 있어도 nginx(4300) 가 확인을 안 해서 그냥 재생된다.
- Oinzi 브라우저는 mp4 재생이 안 된다(원본 주소도 readyState 0) → 플레이어 탐색 잠금은 Oinzi 로 실측 불가. API·Caddy 는 curl 로 검증.
- 옛 WP 진도는 watchedSec 가 없어, 미완료 영상은 처음부터 봐야 완료된다(완료된 레슨은 그대로).
- 서버 반영(2026-11-10, DEPLOYED_COMMIT be4872d): 서버 .env 에 MEDIA_SIGNING_SECRET 추가, app 재빌드 후 caddy 는 `up -d --force-recreate caddy` (Caddyfile 이 단일 파일 bind mount 라 tar 로 덮으면 재생성해야 새 내용을 본다). 확인: 원본 주소 403, 위조 403, 만료 410, 서명 206, /uploads 200.
