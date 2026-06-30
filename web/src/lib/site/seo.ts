export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

/** Bump when public marketing/SEO pages change materially. */
export const SITEMAP_LAST_MODIFIED = new Date("2026-06-30T00:00:00.000Z");

/** High-intent phrases Miami roofing contractors search for. */
export const CONTRACTOR_SEO_KEYWORDS = [
  "Miami roofing leads",
  "Miami-Dade roofing contractor leads",
  "roofing contractor leads Florida",
  "Miami roof replacement leads",
  "aging roof leads Miami",
  "roofing lead subscription Miami",
  "roof canvassing Miami",
  "Miami-Dade roof replacement",
  "roofing sales leads Miami-Dade",
  "canvassing leads Miami roofers",
  "Bloom Zones Miami",
  "DataBloom Score",
  "Miami code violation roofing leads",
  "roofing lead generation Miami",
] as const;

export const HOME_PAGE_TITLE =
  "Miami Roofing Leads for Contractors — Aging Roofs & Bloom Zones | DataBloomer";

export const HOME_PAGE_DESCRIPTION =
  "Subscription roofing lead intelligence for Miami-Dade contractors: 55,000+ aging roof leads, color-coded Bloom Zone maps, DataBloom Score ranking, code violations, estimated job size, and canvassing tools. Built for Florida roofers.";

export function buildOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: "DataBloomer",
    url: APP_URL,
    logo: `${APP_URL}/opengraph-image`,
    description: HOME_PAGE_DESCRIPTION,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Miami-Dade County, Florida",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${APP_URL}/#website`,
    name: "DataBloomer",
    url: APP_URL,
    description: HOME_PAGE_DESCRIPTION,
    publisher: { "@id": `${APP_URL}/#organization` },
    inLanguage: "en-US",
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${APP_URL}/#software`,
    name: "DataBloomer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: APP_URL,
    description: HOME_PAGE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free preview; paid subscription for full Miami-Dade access",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Roofing contractors in Miami-Dade County, Florida",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Miami-Dade County, Florida",
    },
  };
}

export function buildHomePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(),
      buildWebSiteJsonLd(),
      buildSoftwareApplicationJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${APP_URL}/#webpage`,
        url: APP_URL,
        name: HOME_PAGE_TITLE,
        description: HOME_PAGE_DESCRIPTION,
        isPartOf: { "@id": `${APP_URL}/#website` },
        about: { "@id": `${APP_URL}/#software` },
        inLanguage: "en-US",
      },
    ],
  };
}

export function defaultOpenGraph(
  title: string,
  description: string,
  path = "",
): {
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale: string;
  type: "website";
} {
  return {
    title,
    description,
    url: path ? `${APP_URL}${path}` : APP_URL,
    siteName: "DataBloomer",
    locale: "en_US",
    type: "website",
  };
}
