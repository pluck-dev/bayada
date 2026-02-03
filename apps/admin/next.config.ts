import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: {
    "/**": ["node_modules/.pnpm/**/.prisma/client/*"],
  },
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
};

export default nextConfig;
