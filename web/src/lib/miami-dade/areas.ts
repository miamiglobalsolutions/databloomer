import {
  AREA_REGION_LABELS,
  AREA_REGION_ORDER,
  type MiamiAreaRegion,
} from "./area-regions";

export type { MiamiAreaRegion };
export { AREA_REGION_LABELS, AREA_REGION_ORDER };

/** Quick filters on the dashboard */
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
  { label: "Westchester", zip: "33165" },
  { label: "Hialeah", zip: "33012" },
  { label: "All county", zip: "" },
] as const;

export type MiamiAreaKind = "city" | "neighborhood" | "village" | "town";

export type MiamiAreaPage = {
  slug: string;
  name: string;
  zip: string;
  region: MiamiAreaRegion;
  kind: MiamiAreaKind;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  highlights: string[];
};

function area(
  slug: string,
  name: string,
  zip: string,
  region: MiamiAreaRegion,
  kind: MiamiAreaKind,
  intro: string,
  highlights: string[],
  extraKeywords: string[] = [],
): MiamiAreaPage {
  const title = `${name} Roofing Leads — ${zip} Miami-Dade | DataBloomer`;
  const description = `${name} (${zip}) aging roof leads, Bloom Zones, and Neighborhood Bloom forecast for Miami-Dade roofing contractors.`;
  return {
    slug,
    name,
    zip,
    region,
    kind,
    title,
    description,
    keywords: [
      `${name} roofing leads`,
      `${zip} roof replacement`,
      `${name} roofing contractor leads`,
      ...extraKeywords,
    ],
    intro,
    highlights,
  };
}

export const MIAMI_AREA_PAGES: MiamiAreaPage[] = [
  // —— Central Miami & neighborhoods ——
  area(
    "brickell",
    "Brickell",
    "33131",
    "central",
    "neighborhood",
    "Brickell's condo towers and luxury residences mean high-value re-roof opportunities. DataBloomer surfaces aging roofs in ZIP 33131 so your canvassing crew hits the right buildings first.",
    [
      "High assessed-value properties boost DataBloom Score",
      "Bloom Zones show dense orange and red clusters for canvassing",
      "Neighborhood Bloom forecast ranks 33131 permit momentum",
    ],
    ["Brickell high-rise roof leads", "33131 roof replacement"],
  ),
  area(
    "downtown",
    "Downtown Miami",
    "33130",
    "central",
    "neighborhood",
    "Downtown Miami mixes commercial and residential stock — both need proactive roof replacement outreach. Filter leads by 33130 and deploy canvassers to the hottest Bloom Zones.",
    [
      "Mix of aging commercial and residential roofs",
      "List and interactive map views for subscribers",
      "Interactive map for field teams",
    ],
    ["Downtown Miami roofing leads"],
  ),
  area(
    "coconut-grove",
    "Coconut Grove",
    "33133",
    "central",
    "neighborhood",
    "Coconut Grove's mature housing stock makes it ideal for aging-roof prospecting. Use Bloom Zones to see where replacement-likely pins cluster in 33133.",
    [
      "Older housing stock increases aging-roof signals",
      "Open code enforcement leads when available",
      "Top Bloom ZIP ranking for the Grove",
    ],
  ),
  area(
    "coral-gables",
    "Coral Gables",
    "33134",
    "central",
    "city",
    "Coral Gables homes — often tile and shingle — enter the replacement window on predictable cycles. DataBloomer ranks 33134 leads by roof age and property value.",
    [
      "Strong tile-roof replacement market",
      "High-value homeowner targets",
      "Neighborhood-focused Bloom Zone view",
    ],
    ["Coral Gables tile roof replacement"],
  ),
  area(
    "little-havana",
    "Little Havana",
    "33135",
    "central",
    "neighborhood",
    "Little Havana offers volume opportunities for residential re-roofs. DataBloomer helps you prioritize 33135 blocks with the highest DataBloom Scores.",
    [
      "Volume residential replacement market",
      "Affordable canvassing route planning",
      "Weekly email digest includes hot ZIPs",
    ],
  ),
  area(
    "wynwood",
    "Wynwood",
    "33137",
    "central",
    "neighborhood",
    "Wynwood's mix of renovated properties and older stock creates varied roof ages. Target 33137 with color-coded Bloom Zone pins on the map.",
    [
      "Mixed housing ages for targeted outreach",
      "Bloom Zones highlight high-opportunity blocks",
      "Export leads for your sales team",
    ],
    ["Wynwood Miami roof leads"],
  ),
  area(
    "miami",
    "Miami",
    "33125",
    "central",
    "city",
    "The City of Miami spans dozens of ZIP codes — 33125 anchors central residential corridors west of downtown. DataBloomer covers the full city with county-wide Bloom Zones and ZIP filters.",
    [
      "County-wide aging roof inventory across Miami city limits",
      "Filter any Miami ZIP from the dashboard",
      "Neighborhood pages for Brickell, Wynwood, and more",
    ],
    ["City of Miami roofing leads", "Miami roof replacement leads"],
  ),
  area(
    "south-miami",
    "South Miami",
    "33143",
    "central",
    "city",
    "South Miami's established single-family neighborhoods are a steady source of aging shingle and tile roofs. Target 33143 with DataBloom Score ranking and Bloom forecast data.",
    [
      "Mature suburban housing stock",
      "Strong door-knock canvassing potential",
      "Bloom forecast tracks local permit momentum",
    ],
  ),
  area(
    "west-miami",
    "West Miami",
    "33144",
    "west",
    "city",
    "West Miami sits between Coral Gables and Sweetwater with dense residential blocks ideal for neighborhood canvassing. Focus on 33144 leads ranked by roof age.",
    [
      "Compact city with high roof density per mile",
      "Interactive map for small crew routes",
      "Close to major west Miami-Dade markets",
    ],
  ),

  // —— Beaches & barrier islands ——
  area(
    "south-beach",
    "South Beach",
    "33139",
    "beaches",
    "neighborhood",
    "Salt air and hurricane exposure accelerate roof aging in South Beach. Target 33139 with DataBloomer's aging-roof leads and open code enforcement cases.",
    [
      "Coastal properties in the 13–25 year aging roof window",
      "Weekly Bloom Zone digest for 33139 opportunities",
      "Map pins color-coded by replacement likelihood",
    ],
    ["South Beach roofing leads", "Miami Beach roof replacement"],
  ),
  area(
    "miami-beach",
    "Miami Beach",
    "33141",
    "beaches",
    "city",
    "Miami Beach combines high-rise condos, Art Deco stock, and single-family homes — all with accelerated coastal roof wear. DataBloomer covers 33141 and linked beach ZIPs.",
    [
      "Coastal aging-roof inventory",
      "High assessed values on many parcels",
      "Bloom Zones for subscriber map canvassing",
    ],
    ["Miami Beach roofing contractor"],
  ),
  area(
    "surfside",
    "Surfside",
    "33154",
    "beaches",
    "town",
    "Surfside's beachfront condos and residential streets need proactive re-roof outreach after salt exposure and storm seasons. Prospect 33154 with DataBloom-ranked leads.",
    [
      "Beachfront replacement demand",
      "Concentrated ZIP for focused canvassing",
      "Neighborhood Bloom forecast when data qualifies",
    ],
  ),
  area(
    "bal-harbour",
    "Bal Harbour",
    "33154",
    "beaches",
    "village",
    "Bal Harbour's luxury condos and estates represent high-ticket re-roof opportunities. DataBloomer surfaces aging roofs in 33154 with value-weighted DataBloom Scores.",
    [
      "Premium property values boost lead scores",
      "Ideal for high-end roofing contractors",
      "Map and list views for 33154",
    ],
  ),
  area(
    "bay-harbor-islands",
    "Bay Harbor Islands",
    "33154",
    "beaches",
    "village",
    "Bay Harbor Islands' waterfront homes and mid-rise buildings sit in the aging-roof sweet spot. Target 33154 before competitors blanket the islands.",
    [
      "Waterfront housing with aging inventory",
      "ZIP-level Bloom forecast available",
      "Export routes for island canvassing",
    ],
  ),
  area(
    "sunny-isles-beach",
    "Sunny Isles Beach",
    "33160",
    "beaches",
    "city",
    "Sunny Isles Beach's condo canyon along Collins Avenue means hundreds of aging flat and pitched roofs. DataBloomer ranks 33160 leads for tower and low-rise outreach.",
    [
      "High-density condo market",
      "Strong permit activity in beach ZIPs",
      "Bloom Zones show cluster patterns",
    ],
  ),
  area(
    "golden-beach",
    "Golden Beach",
    "33160",
    "beaches",
    "town",
    "Golden Beach estates along the ocean drive high-value re-roof contracts. Use 33160 data to find aging roofs on large single-family parcels.",
    [
      "Luxury single-family targets",
      "High assessed values in DataBloom Score",
      "County GIS parcel and permit data",
    ],
  ),
  area(
    "north-bay-village",
    "North Bay Village",
    "33141",
    "beaches",
    "village",
    "North Bay Village's island communities mix waterfront condos and single-family homes in the 33141 corridor. Bloom Zones help crews prioritize blocks with the oldest roofs.",
    [
      "Island neighborhoods with aging stock",
      "Filter 33141 on dashboard map",
      "Subscriber map view for routes",
    ],
  ),
  area(
    "key-biscayne",
    "Key Biscayne",
    "33149",
    "beaches",
    "village",
    "Key Biscayne's island homes face constant sun and salt — roofs age faster than inland Miami-Dade. Prospect 33149 with DataBloomer's aging-roof AI Intelligence.",
    [
      "Island market with premium home values",
      "Aging roof window 13–25 years",
      "Bloom forecast for ZIP-level planning",
    ],
  ),
  area(
    "indian-creek",
    "Indian Creek",
    "33154",
    "beaches",
    "village",
    "Indian Creek Village's exclusive estates are ultra-high-value re-roof targets. DataBloomer includes 33154 parcels so your team spots aging roofs on landmark properties.",
    [
      "Ultra-high assessed values",
      "Low volume, high ticket opportunities",
      "Full subscriber address and folio access",
    ],
  ),

  // —— North Miami-Dade ——
  area(
    "aventura",
    "Aventura",
    "33180",
    "north",
    "city",
    "Aventura's condos and townhomes along the county line create steady re-roof demand. DataBloomer ranks 33180 aging roofs and shows where permit momentum is rising.",
    [
      "Dense multi-family and condo stock",
      "Neighborhood Bloom forecast for 33180",
      "Top Bloom ZIP rankings in dashboard",
    ],
  ),
  area(
    "north-miami",
    "North Miami",
    "33161",
    "north",
    "city",
    "North Miami's residential neighborhoods offer volume aging-roof leads for residential roofers. Filter 33161 and deploy canvassers to red-zone Bloom pins.",
    [
      "Volume single-family market",
      "ZIP-level lead list and map",
      "Weekly digest highlights hot north county ZIPs",
    ],
  ),
  area(
    "north-miami-beach",
    "North Miami Beach",
    "33162",
    "north",
    "city",
    "North Miami Beach mixes condos, duplexes, and single-family homes — all entering the replacement window on different cycles. Target 33162 with DataBloom Scores.",
    [
      "Mixed housing types in one ZIP cluster",
      "Coastal influence on roof aging",
      "Bloom Zones for crew routing",
    ],
  ),
  area(
    "miami-gardens",
    "Miami Gardens",
    "33056",
    "north",
    "city",
    "Miami Gardens is one of north county's largest residential markets. DataBloomer loads thousands of aging-roof leads in 33056 for door-knock and mailer campaigns.",
    [
      "Large aging-roof inventory",
      "Strong suburban canvassing volume",
      "Neighborhood Bloom forecast when qualified",
    ],
  ),
  area(
    "miami-lakes",
    "Miami Lakes",
    "33014",
    "north",
    "city",
    "Miami Lakes' planned communities and single-family homes built in the 2000s are now hitting the 13–25 year aging roof window. Focus crews on 33014.",
    [
      "Planned community roof replacement cycles",
      "Suburban routes ideal for canvassing",
      "DataBloom Score ranks oldest roofs first",
    ],
  ),
  area(
    "miami-shores",
    "Miami Shores",
    "33138",
    "north",
    "village",
    "Miami Shores' tree-lined streets and 1920s–2000s housing stock make it a prime aging-roof market. Prospect 33138 with Bloom Zones and folio-level detail.",
    [
      "Established village with mature homes",
      "High homeowner occupancy",
      "Map view for subscriber crews",
    ],
  ),
  area(
    "el-portal",
    "El Portal",
    "33150",
    "north",
    "village",
    "El Portal's small residential village north of Miami sits in the 33150 ZIP with steady re-roof potential. DataBloomer helps local roofers own this tight market.",
    [
      "Compact village — efficient canvassing routes",
      "Aging inventory from county GIS",
      "ZIP filter on dashboard",
    ],
  ),
  area(
    "biscayne-park",
    "Biscayne Park",
    "33161",
    "north",
    "village",
    "Biscayne Park's single-family homes share the 33161 corridor with North Miami. Target aging roofs in this quiet village before larger competitors.",
    [
      "Residential village market",
      "Shared ZIP data with north Miami corridor",
      "Bloom forecast and Top Bloom ZIP panels",
    ],
  ),
  area(
    "opa-locka",
    "Opa-locka",
    "33054",
    "north",
    "city",
    "Opa-locka's residential and commercial stock in 33054 offers volume re-roof opportunities. DataBloomer surfaces aging roofs ranked by DataBloom Score.",
    [
      "Volume market for residential roofers",
      "Code enforcement leads when available",
      "County-wide ingest includes 33054",
    ],
  ),

  // —— South Miami-Dade ——
  area(
    "homestead",
    "Homestead",
    "33030",
    "south",
    "city",
    "Homestead and south county saw heavy building in the 2001–2013 window — prime aging-roof territory. DataBloomer includes one of the largest 33030 lead inventories in the county.",
    [
      "Large aging-roof inventory south county",
      "Post-storm replacement demand",
      "County-wide Bloom Zones include Homestead clusters",
    ],
    ["South Miami-Dade roofer leads"],
  ),
  area(
    "kendall",
    "Kendall",
    "33176",
    "south",
    "neighborhood",
    "Kendall's suburban single-family homes are a staple for residential roofers. Filter 33176 leads and focus on red-zone replacement prospects.",
    [
      "Suburban single-family replacement volume",
      "Strong DataBloom Score spread",
      "Ideal for door-to-door canvassing routes",
    ],
  ),
  area(
    "cutler-bay",
    "Cutler Bay",
    "33189",
    "south",
    "city",
    "Cutler Bay grew rapidly in the 2000s — those roofs are now in the replacement window. DataBloomer ranks 33189 aging roofs for south county crews.",
    [
      "2000s build boom = aging inventory today",
      "South Dade canvassing routes",
      "Neighborhood Bloom forecast",
    ],
  ),
  area(
    "palmetto-bay",
    "Palmetto Bay",
    "33157",
    "south",
    "city",
    "Palmetto Bay's upscale single-family homes along Old Cutler are high-value re-roof targets. Prospect 33157 with assessed-value-weighted DataBloom Scores.",
    [
      "Upscale suburban homeowners",
      "Tile and shingle replacement market",
      "Bloom Zones on subscriber map",
    ],
  ),
  area(
    "pinecrest",
    "Pinecrest",
    "33156",
    "south",
    "city",
    "Pinecrest estates and large-lot homes command premium re-roof contracts. DataBloomer surfaces 33156 aging roofs with high assessed values in the scoring model.",
    [
      "Premium south Miami-Dade market",
      "Large-lot single-family homes",
      "High DataBloom Scores on valuable parcels",
    ],
  ),
  area(
    "florida-city",
    "Florida City",
    "33034",
    "south",
    "city",
    "Florida City anchors the gateway to the Keys and south agricultural county — with growing residential stock in 33034. Target aging roofs before storm season pushes demand higher.",
    [
      "South county growth market",
      "Aging roof window 13–25 years",
      "ZIP-level dashboard filters",
    ],
  ),
  area(
    "tamiami",
    "Tamiami",
    "33184",
    "south",
    "neighborhood",
    "Tamiami and west Kendall corridors along 33184 combine volume housing and busy contractor competition. DataBloomer shows where aging roofs cluster in the ZIP.",
    [
      "High-volume residential corridors",
      "West Dade crossover market",
      "Bloom forecast for replacement waves",
    ],
  ),

  // —— West Miami-Dade ——
  area(
    "westchester",
    "Westchester",
    "33165",
    "west",
    "neighborhood",
    "Westchester is one of Miami-Dade's largest residential ZIPs — hundreds of 1980s–2000s homes now need re-roofs. DataBloomer loads full 33165 aging inventory from county GIS.",
    [
      "One of the county's largest aging-roof ZIPs",
      "Suburban canvassing at scale",
      "Neighborhood Bloom forecast for 33165",
    ],
    ["Westchester roof replacement", "33165 roofing leads"],
  ),
  area(
    "doral",
    "Doral",
    "33166",
    "west",
    "city",
    "Doral's boom-era homes and townhouses in 33166 are entering peak replacement years. Rank leads by DataBloom Score and watch bloom forecast for rising permit momentum.",
    [
      "Fast-growing city with 2000s housing stock",
      "Strong 33166 lead counts",
      "Ideal for established west Miami crews",
    ],
  ),
  area(
    "hialeah",
    "Hialeah",
    "33012",
    "west",
    "city",
    "Hialeah is Miami-Dade's largest city by population — massive aging-roof volume in 33012 and surrounding ZIPs. DataBloomer gives Hialeah roofers county-grade lead AI Intelligence.",
    [
      "Highest volume west market",
      "Dense residential blocks for canvassing",
      "Full ZIP filter and map view",
    ],
    ["Hialeah roofing contractor leads"],
  ),
  area(
    "hialeah-gardens",
    "Hialeah Gardens",
    "33018",
    "west",
    "city",
    "Hialeah Gardens' single-family neighborhoods in 33018 are a natural extension for west Miami-Dade roofers. Filter 33018 leads on the dashboard map.",
    [
      "Suburban west county market",
      "Aging roofs from 2001–2013 builds",
      "Interactive map for crews",
    ],
  ),
  area(
    "sweetwater",
    "Sweetwater",
    "33174",
    "west",
    "city",
    "Sweetwater's residential density in 33174 creates steady re-roof demand. DataBloomer ranks aging roofs so your team works the highest-opportunity blocks first.",
    [
      "Dense 33174 housing stock",
      "Close to Tamiami and Westchester markets",
      "Bloom Zones on interactive map",
    ],
  ),
  area(
    "miami-springs",
    "Miami Springs",
    "33166",
    "west",
    "city",
    "Miami Springs' historic village charm masks a core of aging shingle roofs on 1950s–2000s homes. Prospect the 33166 corridor with DataBloomer leads.",
    [
      "Mix of older and 2000s housing stock",
      "Village identity — tight local market",
      "Neighborhood Bloom data when available",
    ],
  ),
  area(
    "virginia-gardens",
    "Virginia Gardens",
    "33166",
    "west",
    "village",
    "Virginia Gardens is a small city with big re-roof potential near Miami International Airport. Target 33166 aging roofs alongside Doral and Miami Springs campaigns.",
    [
      "Compact market near airport corridor",
      "Commercial and residential mix",
      "ZIP-shared data with west hub 33166",
    ],
  ),
  area(
    "medley",
    "Medley",
    "33166",
    "west",
    "town",
    "Medley's industrial and residential edges in the 33166 hub include aging commercial roofs and nearby worker housing. DataBloomer covers Medley parcels in county ingest.",
    [
      "Industrial corridor opportunities",
      "West Miami-Dade hub ZIP",
      "Code and aging roof lead streams",
    ],
  ),
];

/** Featured on homepage and footer — highest contractor demand */
export const FEATURED_AREA_SLUGS = [
  "brickell",
  "coral-gables",
  "kendall",
  "westchester",
  "hialeah",
  "homestead",
  "doral",
  "aventura",
  "miami-beach",
  "palmetto-bay",
] as const;

export function getAreaBySlug(slug: string): MiamiAreaPage | undefined {
  return MIAMI_AREA_PAGES.find((a) => a.slug === slug);
}

export function getAreaSlugs(): string[] {
  return MIAMI_AREA_PAGES.map((a) => a.slug);
}

export function getFeaturedAreas(): MiamiAreaPage[] {
  return FEATURED_AREA_SLUGS.map(
    (slug) => MIAMI_AREA_PAGES.find((a) => a.slug === slug)!,
  ).filter(Boolean);
}

export function getAreasByRegion(): Record<MiamiAreaRegion, MiamiAreaPage[]> {
  const grouped = Object.fromEntries(
    AREA_REGION_ORDER.map((region) => [region, [] as MiamiAreaPage[]]),
  ) as Record<MiamiAreaRegion, MiamiAreaPage[]>;

  for (const page of MIAMI_AREA_PAGES) {
    grouped[page.region].push(page);
  }

  for (const region of AREA_REGION_ORDER) {
    grouped[region].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}
