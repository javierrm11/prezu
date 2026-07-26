import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return [
    { url: BASE_URL, lastModified: ahora, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/registro`, lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
  ];
}
