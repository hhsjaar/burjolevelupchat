import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/webhooks/wa',
        destination: '/api/webhook/whatsapp',
      },
    ]
  },
};

export default nextConfig;
