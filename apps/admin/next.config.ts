import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 개발 표시기가 사이드바 하단 사용자 영역을 가려 끈다
  devIndicators: false,
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: {
    "/**": ["node_modules/.pnpm/**/.prisma/client/*"],
  },
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
};

export default nextConfig;
