import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "yolyardim.vercel.app" }],
        destination: "https://www.tulparassist.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "geolocation=*" },
        ],
      },
    ];
  },
};

export default nextConfig;
