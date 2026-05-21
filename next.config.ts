import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    formats: ["image/webp"],
  },
};

export default nextConfig;
