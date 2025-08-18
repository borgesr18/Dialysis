/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['https://dialysis-jk5e.vercel.app'] },
  },
};
export default nextConfig;
