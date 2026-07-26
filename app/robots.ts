import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rutas del panel autenticado y de la API: no hay nada que
      // indexar ahí, y /p/[token] ya lleva su propio noindex por
      // metadata (regla 5: página pública sin exponer más datos).
      disallow: [
        "/dashboard",
        "/presupuestos",
        "/facturas",
        "/clientes",
        "/catalogo",
        "/ajustes",
        "/suscripcion",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
