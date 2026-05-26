import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Define a raiz do projeto para evitar conflito com lockfiles do monorepo pai
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
