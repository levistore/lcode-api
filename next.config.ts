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
  }
};

export default nextConfig;
