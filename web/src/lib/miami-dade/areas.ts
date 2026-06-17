/** Quick filters + SEO landing pages for core Miami-Dade markets */
export const AREA_ZIP_SHORTCUTS = [
  { label: "Brickell", zip: "33131" },
  { label: "South Beach", zip: "33139" },
  { label: "Downtown", zip: "33130" },
  { label: "Coral Gables", zip: "33134" },
  { label: "Coconut Grove", zip: "33133" },
  { label: "Little Havana", zip: "33135" },
  { label: "Wynwood", zip: "33137" },
  { label: "Homestead", zip: "33030" },
  { label: "Kendall", zip: "33176" },
  { label: "All county", zip: "" },
] as const;

export type MiamiAreaPage = {
  slug: string;
  name: string;
  zip: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  highlights: string[];
};

export const MIAMI_AREA_PAGES: MiamiAreaPage[] = [
  {
    slug: "brickell",
    name: "Brickell",
    zip: "33131",
    title: "Brickell Roofing Leads — DataBloomer Bloom Zones",
    description:
      "Find aging roof and replacement leads in Brickell (33131) with DataBloom Score ranking and Bloom Zones for Miami roofing contractors.",
    keywords: [
      "Brickell roofing leads",
      "33131 roof replacement",
      "Brickell roofing contractor leads",
      "Miami high-rise roof leads",
    ],
    intro:
      "Brickell's condo towers and luxury residences mean high-value re-roof opportunities. DataBloomer surfaces aging roofs in ZIP 33131 so your canvassing crew hits the right buildings first.",
    highlights: [
      "High assessed-value properties boost DataBloom Score",
      "Bloom Zones show dense orange/red clusters for canvassing",
      "Export CSV routes for door-knock teams",
    ],
  },
  {
    slug: "south-beach",
    name: "South Beach",
    zip: "33139",
    title: "South Beach Roofing Leads — Miami Beach 33139",
    description:
      "South Beach and Miami Beach roofing leads with DataBloom Score and Bloom Zones for contractors targeting 33139.",
    keywords: [
      "South Beach roofing leads",
      "Miami Beach roof replacement",
      "33139 roofing contractor",
    ],
    intro:
      "Salt air and hurricane exposure accelerate roof aging in South Beach. Target 33139 with DataBloomer's aging-roof leads and open code enforcement cases.",
    highlights: [
      "Coastal properties in the 13–25 year aging roof window",
      "Weekly Bloom Zone digest for 33139 opportunities",
      "Map pins color-coded by replacement likelihood",
    ],
  },
  {
    slug: "downtown",
    name: "Downtown Miami",
    zip: "33130",
    title: "Downtown Miami Roofing Leads — 33130",
    description:
      "Downtown Miami roofing lead generation for contractors. Aging roofs, DataBloom Score, and Bloom Zones in ZIP 33130.",
    keywords: ["Downtown Miami roofing leads", "33130 roof replacement"],
    intro:
      "Downtown Miami mixes commercial and residential stock — both need proactive roof replacement outreach. Filter leads by 33130 and deploy canvassers to the hottest Bloom Zones.",
    highlights: [
      "Mix of aging commercial and residential roofs",
      "List and Bloom Zone map views",
      "CSV export for field teams",
    ],
  },
  {
    slug: "coral-gables",
    name: "Coral Gables",
    zip: "33134",
    title: "Coral Gables Roofing Leads — 33134",
    description:
      "Coral Gables aging roof leads for Miami-Dade roofing contractors. DataBloom Score ranked prospects in 33134.",
    keywords: [
      "Coral Gables roofing leads",
      "33134 tile roof replacement",
      "Coral Gables roofer sales leads",
    ],
    intro:
      "Coral Gables homes — often tile and shingle — enter the replacement window on predictable cycles. DataBloomer ranks 33134 leads by roof age and property value.",
    highlights: [
      "Strong tile-roof replacement market",
      "High-value homeowner targets",
      "Neighborhood-focused Bloom Zone view",
    ],
  },
  {
    slug: "coconut-grove",
    name: "Coconut Grove",
    zip: "33133",
    title: "Coconut Grove Roofing Leads — 33133",
    description:
      "Coconut Grove roofing leads and Bloom Zones for ZIP 33133. Find aging roofs before competitors.",
    keywords: ["Coconut Grove roofing leads", "33133 roof replacement"],
    intro:
      "Coconut Grove's mature housing stock makes it ideal for aging-roof prospecting. Use Bloom Zones to see where replacement-likely pins cluster in 33133.",
    highlights: [
      "Older housing stock = more aging-roof signals",
      "Open code enforcement leads when available",
      "Top Bloom ZIP ranking for the Grove",
    ],
  },
  {
    slug: "little-havana",
    name: "Little Havana",
    zip: "33135",
    title: "Little Havana Roofing Leads — 33135",
    description:
      "Little Havana Miami roofing leads in ZIP 33135. DataBloomer for local contractor canvassing.",
    keywords: ["Little Havana roofing leads", "33135 roof replacement Miami"],
    intro:
      "Little Havana offers volume opportunities for residential re-roofs. DataBloomer helps you prioritize 33135 blocks with the highest DataBloom Scores.",
    highlights: [
      "Volume residential replacement market",
      "Affordable canvassing route planning",
      "Weekly email digest includes hot ZIPs",
    ],
  },
  {
    slug: "wynwood",
    name: "Wynwood",
    zip: "33137",
    title: "Wynwood Roofing Leads — 33137",
    description:
      "Wynwood and Edgewater roofing leads in 33137 with DataBloom Score ranking.",
    keywords: ["Wynwood roofing leads", "33137 Miami roof leads"],
    intro:
      "Wynwood's mix of renovated properties and older stock creates varied roof ages. Target 33137 with color-coded Bloom Zone pins on the map.",
    highlights: [
      "Mixed housing ages for targeted outreach",
      "Bloom Zones highlight high-opportunity blocks",
      "Export leads for your sales team",
    ],
  },
  {
    slug: "homestead",
    name: "Homestead",
    zip: "33030",
    title: "Homestead Roofing Leads — South Miami-Dade 33030",
    description:
      "Homestead and south Miami-Dade roofing leads in ZIP 33030. Aging roof intelligence for contractors.",
    keywords: [
      "Homestead roofing leads",
      "33030 roof replacement",
      "South Miami-Dade roofer leads",
    ],
    intro:
      "Homestead and south county saw heavy building in the 2009–2013 window — prime aging-roof territory. DataBloomer loads thousands of south Miami-Dade leads including 33030.",
    highlights: [
      "Large aging-roof inventory south county",
      "Post-storm replacement demand",
      "County-wide Bloom Zones include Homestead clusters",
    ],
  },
  {
    slug: "kendall",
    name: "Kendall",
    zip: "33176",
    title: "Kendall Roofing Leads — 33176 Miami-Dade",
    description:
      "Kendall roofing contractor leads in ZIP 33176. DataBloom Score and Bloom Zones for suburban re-roof prospecting.",
    keywords: [
      "Kendall roofing leads",
      "33176 roof replacement",
      "Kendall roofer canvassing",
    ],
    intro:
      "Kendall's suburban single-family homes are a staple for residential roofers. Filter 33176 leads, export CSV canvassing lists, and focus on red-zone replacement prospects.",
    highlights: [
      "Suburban single-family replacement volume",
      "Strong DataBloom Score spread",
      "Ideal for door-to-door canvassing routes",
    ],
  },
];

export function getAreaBySlug(slug: string): MiamiAreaPage | undefined {
  return MIAMI_AREA_PAGES.find((a) => a.slug === slug);
}

export function getAreaSlugs(): string[] {
  return MIAMI_AREA_PAGES.map((a) => a.slug);
}
