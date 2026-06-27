import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/site/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
