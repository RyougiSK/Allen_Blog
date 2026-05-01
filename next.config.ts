import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/writing/:slug", destination: "/en/:slug", permanent: true },
      { source: "/blog/:slug", destination: "/en/:slug", permanent: true },
      { source: "/blog", destination: "/en/writing", permanent: true },
    ];
  },
};

export default nextConfig;
