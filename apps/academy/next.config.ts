import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bayada/ui", "@bayada/db", "@bayada/shared"],
};

export default nextConfig;
