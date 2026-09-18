import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@puckeditor/core"],
  // Default true: prerender workers load source maps and blow the isolated 2GB heap.
  enablePrerenderSourceMaps: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Isolated 2GB workers accumulate if they render 25 pages × 8 concurrent.
    // One page per process keeps marketing SSG under the default heap.
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1,
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "quotebuilder.co" }],
        destination: "https://www.quotebuilder.co/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "quotebuilder.co" }],
        destination: "https://www.quotebuilder.co/:path*",
        permanent: true,
      },
      { source: "/wizard", destination: "/funnels", permanent: false },
    ];
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
