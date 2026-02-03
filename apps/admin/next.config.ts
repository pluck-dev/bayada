import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
  serverExternalPackages: ["@bayada/db"],
};

export default nextConfig;
