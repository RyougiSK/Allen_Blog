import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/writing/:slug", destination: "/en/:slug", permanent: true },
      { source: "/writing", destination: "/en/writing", permanent: true },
      { source: "/blog/:slug", destination: "/en/:slug", permanent: true },
      { source: "/blog", destination: "/en/writing", permanent: true },
      { source: "/about", destination: "/en/about", permanent: true },
      { source: "/themes", destination: "/en/themes", permanent: true },
      { source: "/subscribe", destination: "/en/subscribe", permanent: true },
    ];
  },
};

export default nextConfig;
