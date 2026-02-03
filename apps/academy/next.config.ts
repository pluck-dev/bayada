import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
