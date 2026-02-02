import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bayada/ui", "@bayada/shared"],
  async redirects() {
    return [
      // 기존 URL → 새 URL 리다이렉트
      { source: "/:locale/services", destination: "/:locale/what-we-do", permanent: true },
      { source: "/:locale/services/:slug", destination: "/:locale/what-we-do/:slug", permanent: true },
      { source: "/:locale/ceo", destination: "/:locale/about", permanent: true },
      { source: "/:locale/bayada-way", destination: "/:locale/about", permanent: true },
      { source: "/:locale/center", destination: "/:locale/contact", permanent: true },
      { source: "/:locale/consultation", destination: "/:locale/contact", permanent: true },
      { source: "/:locale/partners", destination: "/:locale/partnership", permanent: true },
    ];
  },
};

export default nextConfig;
