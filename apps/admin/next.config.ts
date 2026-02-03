import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bayada/ui", "@bayada/db", "@bayada/shared"],
  serverExternalPackages: ["@prisma/client", ".prisma"],
};

export default nextConfig;
