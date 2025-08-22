/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar export estático
  output: undefined,
  trailingSlash: false,
  // Configurar para renderização dinâmica
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
  // Configurações para evitar problemas de export
  images: {
    unoptimized: false,
    domains: ['storage.googleapis.com'],
  },
};

export default nextConfig;
