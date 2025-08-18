import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://SEU-DOMINIO.vercel.app/', lastModified: new Date() },
    { url: 'https://SEU-DOMINIO.vercel.app/pacientes', lastModified: new Date() },
    { url: 'https://SEU-DOMINIO.vercel.app/salas', lastModified: new Date() },
    { url: 'https://SEU-DOMINIO.vercel.app/turnos', lastModified: new Date() },
    { url: 'https://SEU-DOMINIO.vercel.app/agenda', lastModified: new Date() },
  ];
}
