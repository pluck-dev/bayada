import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Docker 이미지(deploy/)에서 node server.js 로 실행한다
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  // 콘텐츠·문의 CRM 을 DB(@bayada/db)에서 읽는다 — standalone 이미지에 Prisma 엔진 포함
  outputFileTracingIncludes: {
    "/**": ["node_modules/.pnpm/**/.prisma/client/*"],
  },
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
  async redirects() {
    return [
      // 기존 URL → 새 URL 리다이렉트
      { source: "/:locale/services", destination: "/:locale/what-we-do", permanent: true },
      { source: "/:locale/services/:slug", destination: "/:locale/what-we-do/:slug", permanent: true },
      { source: "/:locale/ceo", destination: "/:locale/about", permanent: true },
      { source: "/:locale/bayada-way", destination: "/:locale/about", permanent: true },
      { source: "/:locale/center", destination: "/:locale/contact", permanent: true },
      { source: "/:locale/consultation", destination: "/:locale/contact", permanent: true },
      { source: "/:locale/partners", destination: "/:locale/partnership", permanent: true },
    ];
  },
};

export default nextConfig;
