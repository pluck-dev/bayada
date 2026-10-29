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
