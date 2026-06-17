import type { MetadataRoute } from "next";
import { MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const areaEntries: MetadataRoute.Sitemap = MIAMI_AREA_PAGES.map((area) => ({
    url: `${appUrl}/areas/${area.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    {
      url: appUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${appUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${appUrl}/subscribe`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${appUrl}/areas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...areaEntries,
    {
      url: `${appUrl}/dashboard`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
