import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
};

export default nextConfig;
