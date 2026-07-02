import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.18.59",
    "10.177.249.50:3000",
    "10.177.249.50",
    "wild-teams-dig.loca.lt",
    "localhost:3000",
    "127.0.0.1:3000",
    "127.0.0.1"
  ],
  experimental: {
    cpus: 1,
    workerThreads: false
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  }
};

export default nextConfig;
