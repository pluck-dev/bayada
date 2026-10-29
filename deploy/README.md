# 아카데미 v2 — 로컬 Docker 운영 스택

개발 서버(3100/3200)와 별개로, 운영과 같은 방식(빌드된 이미지 + DB + 미디어 서버)으로 띄운다.

| 서비스 | 주소 | 내용 |
|---|---|---|
| academy | http://localhost:4100 | 수강생 사이트 (`Dockerfile`, APP=academy) |
| admin | http://localhost:4200 | 관리자 (`Dockerfile`, APP=admin) |
| media | http://localhost:4300 | `/videos/` 레슨 영상, `/uploads/` 옛 사이트 썸네일 |
| db | 127.0.0.1:5435 | PostgreSQL 16 (볼륨 `bayada-academy_pgdata`) |

## 처음 띄우기

```bash
cp deploy/.env.example deploy/.env      # 비밀값 3개를 openssl rand -base64 32 로 채운다
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d db media

# 스키마 + 옛 사이트 데이터 (워드프레스 복원판 MySQL 127.0.0.1:3307 이 떠 있어야 한다)
export DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:5435/bayada DIRECT_URL=$DATABASE_URL
pnpm --filter @bayada/db exec prisma db push
VIDEO_BASE_URL=http://localhost:4300/videos/ UPLOADS_BASE_URL=http://localhost:4300/uploads/ \
  pnpm --filter @bayada/db import:wp

docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build academy admin
```

코드를 바꾼 뒤에는 `up -d --build academy admin` 만 다시 하면 된다. DB 데이터는 볼륨에 남는다.

## AWS / Supabase 로 옮길 때

- **DB**: Supabase 또는 RDS 를 만들고 `prisma db push` → `import:wp` 를 그 주소로 다시 돌린다 (또는 `pg_dump` 로 이 DB 를 옮긴다).
- **미디어**: `web_faststart/*.mp4` 와 `uploads/` 를 S3(+CloudFront) 나 R2 에 올리고, 그 주소로 `VIDEO_BASE_URL`·`UPLOADS_BASE_URL` 을 바꿔 `import:wp` 를 다시 돌린다.
- **앱**: 같은 이미지를 ECR 에 올려 ECS/App Runner 에서 실행한다. 필요한 환경변수는 `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`(앱마다 다르게), `AUTH_TRUST_HOST=true`, `NEXTAUTH_URL`, academy 만 `NEXT_PUBLIC_SITE_URL`.
- 어드민 세션 쿠키 이름은 `bayada-admin.*` 로 분리돼 있어 같은 상위 도메인을 써도 섞이지 않는다.
