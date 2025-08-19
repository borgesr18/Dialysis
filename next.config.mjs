/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
        process.env.APP_URL || '',
      ].filter(Boolean),
    },
  },
};

export default nextConfig;
