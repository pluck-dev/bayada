import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: {
    "/**": ["packages/db/src/generated/prisma/**/*"],
  },
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
  serverExternalPackages: ["@bayada/db"],
};

export default nextConfig;
