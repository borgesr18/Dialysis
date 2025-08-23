/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar export estático
  output: undefined,
  trailingSlash: false,
  // Configurar para renderização dinâmica
  experimental: {
    serverActions: {
      // Remove allowedOrigins to default to same-origin submissions
    },
  },
  // Configurações para evitar problemas de export
  images: {
    unoptimized: false,
    domains: ['storage.googleapis.com'],
  },
};

export default nextConfig;
