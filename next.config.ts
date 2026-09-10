import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@puckeditor/core"],
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async redirects() {
    return [{ source: "/wizard", destination: "/funnels", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
