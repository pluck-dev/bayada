
  1. 사전 준비

  PostgreSQL 이 로컬에
  실행 중이어야 합니다.
   없으면 Docker로
  간단히 띄울 수
  있습니다:

  docker run -d --name
  bayada-db \
    -e POSTGRES_PASSWOR
  D=postgres \
    -e
  POSTGRES_DB=bayada \
    -p 5432:5432 \
    postgres:16

  2. 환경변수 설정

  루트의 .env 파일에
  최소한 아래 값이
  필요합니다:

  DATABASE_URL=postgres
  ql://postgres:postgre
  s@localhost:5432/baya
  da
  NEXTAUTH_SECRET=아무-
  랜덤-문자열
  NEXTAUTH_URL=http://l
  ocalhost:3000

  .env가 이미 있으니
  DATABASE_URL과
  NEXTAUTH_SECRET이
  들어있는지만 확인하
   됩니다.

  3. 의존성 설치 + DB
  세팅

  cd ~/Desktop/pluck/ba
  yada

  # 패키지 설치
  pnpm install

  # DB 스키마 적용
  (테이블 생성)
  pnpm db:push

  4. 개발 서버 실행

  pnpm dev

  3개 앱이 동시에
  뜹니다:
  앱: web
  URL:
  http://localhost:3000
  설명: 고객확보
  웹사이트
  ─────────────────────
  ─
  앱: academy
  URL:
  http://localhost:3100
  설명: 강의 플랫폼
  ─────────────────────
  ─
  앱: admin
  URL:
  http://localhost:3200
  설명: 관리자 시스템
  5. 유용한 명령어

  # DB GUI로 데이터
  확인/편집
  pnpm db:studio

  # 타입체크
  pnpm typecheck

  # 프로덕션 빌드
  pnpm build
