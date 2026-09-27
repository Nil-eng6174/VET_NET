import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/submit',
        destination: 'http://127.0.0.1:5000/submit',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://127.0.0.1:5000/uploads/:path*',
      }
    ]
  },
  // @ts-ignore
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '10.91.194.225',
    '10.28.230.225',
    '*.ngrok-free.dev',
    '*.ngrok.io',
    '*.ngrok.app'
  ]
};

export default nextConfig;
