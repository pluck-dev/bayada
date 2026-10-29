import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Docker 이미지(deploy/)에서 node server.js 로 실행한다. Vercel 배포에도 영향 없음
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: {
    "/**": ["node_modules/.pnpm/**/.prisma/client/*"],
  },
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
};

export default nextConfig;
