# 아카데미(academy) / 어드민(admin) / 홈페이지(web) 공용 이미지.
#   docker build --build-arg APP=academy -t bayada-academy .
#   docker build --build-arg APP=admin   -t bayada-admin .
# 로컬은 deploy/docker-compose.yml, 운영(AWS ECS 등)도 같은 이미지에 환경변수만 바꿔 쓴다.

FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate
WORKDIR /repo

FROM base AS build
ARG APP
# NEXT_PUBLIC_* 는 빌드 시점에 코드에 박힌다 → 사이트 주소는 빌드 인자로 받는다
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY . .
RUN pnpm install --frozen-lockfile
# 빌드 시점에는 DB 에 붙지 않는다. Prisma 클라이언트만 생성한다.
RUN pnpm --filter @bayada/db db:generate
RUN pnpm --filter ./apps/${APP} build
# academy/admin 은 public 폴더가 없다. web 은 있다 → 없으면 빈 폴더를 만들어 COPY 가 항상 되게 한다
RUN mkdir -p apps/${APP}/public

FROM node:22-slim AS runner
ARG APP
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# standalone 출력은 모노레포 루트 기준 구조(apps/<APP>/server.js)를 그대로 갖는다
COPY --from=build /repo/apps/${APP}/.next/standalone ./
COPY --from=build /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=build /repo/apps/${APP}/public ./apps/${APP}/public
ENV APP_DIR=apps/${APP}
# next/image 최적화 캐시를 node 사용자가 쓸 수 있게
RUN mkdir -p ./apps/${APP}/.next/cache && chown -R node:node ./apps/${APP}/.next
USER node
EXPOSE 3000
CMD ["sh", "-c", "node $APP_DIR/server.js"]
