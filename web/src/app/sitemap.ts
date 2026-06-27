import type { MetadataRoute } from "next";
import { MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";
import { APP_URL, SITEMAP_LAST_MODIFIED } from "@/lib/site/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITEMAP_LAST_MODIFIED;

  const areaEntries: MetadataRoute.Sitemap = MIAMI_AREA_PAGES.map((area) => ({
    url: `${APP_URL}/areas/${area.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    {
      url: APP_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/promo`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/subscribe`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${APP_URL}/areas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...areaEntries,
    {
      url: `${APP_URL}/dashboard`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
