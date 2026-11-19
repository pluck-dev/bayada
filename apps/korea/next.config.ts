import type { NextConfig } from "next";
import path from "node:path";
const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  outputFileTracingIncludes: { "/**": ["node_modules/.pnpm/**/.prisma/client/*"] },
  transpilePackages: ["@bayada/korea"],
  poweredByHeader: false,
};
export default config;
