export type SubscriptionBenefit = {
  id: string;
  title: string;
  description: string;
  status: "included" | "coming_soon";
  highlight?: boolean;
};

export const SUBSCRIPTION_BENEFITS: SubscriptionBenefit[] = [
  {
    id: "addresses",
    title: "Full street addresses",
    description:
      "See exact addresses for door knocking and mailers. Free preview blurs addresses until you subscribe.",
    status: "included",
    highlight: true,
  },
  {
    id: "folios",
    title: "Property folio numbers",
    description:
      "Unlock Miami-Dade folio IDs to cross-check permits, ownership, and assessed value in county records.",
    status: "included",
    highlight: true,
  },
  {
    id: "unlimited-access",
    title: "Unlimited monthly access",
    description:
      "Use the dashboard as much as you need — no caps on searches, map loads, or ZIP filters for subscribers.",
    status: "included",
    highlight: true,
  },
  {
    id: "county-map",
    title: "Interactive map view",
    description:
      "Zoom, pan, and explore every color-coded Bloom Zone pin across Miami-Dade (~8,000+ aging roofs) with street and satellite layers.",
    status: "included",
    highlight: true,
  },
  {
    id: "bloom-filters",
    title: "Bloom Zone filters",
    description:
      "Filter by green, yellow, orange, or red zones so canvassers only see the priority level you want.",
    status: "included",
  },
  {
    id: "databloom-score",
    title: "DataBloom Score on every lead",
    description:
      "Leads ranked 0–100 by roof age, home value, and permit confidence — work the best prospects first.",
    status: "included",
  },
  {
    id: "csv-export",
    title: "CSV export for canvassing",
    description:
      "Download full lead lists with address, folio, score, and map coordinates for your CRM or door-knock routes.",
    status: "included",
  },
  {
    id: "top-zips",
    title: "Top Bloom ZIP rankings",
    description:
      "Weekly-ranked ZIP codes showing where replacement-likely leads cluster — plan crew deployment fast.",
    status: "included",
  },
  {
    id: "email-digest",
    title: "Weekly Bloom Zone email digest",
    description:
      "Monday email with the hottest ZIPs and opportunity summary so owners know where to send teams.",
    status: "included",
  },
  {
    id: "aging-roofs",
    title: "Aging roof lead stream",
    description:
      "Homes in the 13–17 year replacement sweet spot plus aging roofs up to 25 years from Miami-Dade property appraiser and permit data.",
    status: "included",
  },
  {
    id: "violations",
    title: "Code enforcement leads",
    description:
      "Open structure and minimum-housing cases — homeowners who may already need roof work.",
    status: "included",
  },
  {
    id: "neighborhoods",
    title: "Neighborhood & ZIP shortcuts",
    description:
      "One-click focus on Brickell, South Beach, Kendall, Homestead, and every core Miami-Dade market.",
    status: "included",
  },
  {
    id: "list-map",
    title: "List + Map View",
    description:
      "Switch between sortable lead cards and the interactive color-coded canvassing map with satellite imagery.",
    status: "included",
  },
  {
    id: "fresh-data",
    title: "Fresh county data",
    description:
      "Leads refreshed from public Miami-Dade GIS on a weekly schedule so you're not working stale lists.",
    status: "included",
  },
  {
    id: "mobile",
    title: "Mobile-friendly for field crews",
    description:
      "Supervisors can pull up Bloom Zones and lead details from a phone on the job site.",
    status: "included",
  },
  {
    id: "flat-pricing",
    title: "Flat monthly pricing",
    description:
      "No per-lead fees. One subscription covers your whole sales and canvassing operation.",
    status: "included",
  },
  {
    id: "watchlists",
    title: "Saved ZIP watchlists",
    description:
      "Pin your territories and get notified when new high-score leads appear in your areas.",
    status: "coming_soon",
  },
  {
    id: "team-seats",
    title: "Multiple team seats",
    description:
      "Add sales reps and canvassing managers under one company account with role-based access.",
    status: "coming_soon",
  },
  {
    id: "route-planner",
    title: "Canvassing route planner",
    description:
      "Auto-order leads into efficient door-knock routes by block and Bloom Zone priority.",
    status: "coming_soon",
  },
  {
    id: "crm-api",
    title: "CRM & API integration",
    description:
      "Push leads to JobNimbus, AccuLynx, Salesforce, or your own systems via API.",
    status: "coming_soon",
  },
  {
    id: "lead-alerts",
    title: "Instant lead alerts",
    description:
      "SMS or email when a new red-zone lead lands in a ZIP you're watching.",
    status: "coming_soon",
  },
  {
    id: "historical",
    title: "Historical lead archive",
    description:
      "Look back at leads over time to measure territory penetration and callback timing.",
    status: "coming_soon",
  },
  {
    id: "competitor-insights",
    title: "Permit activity insights",
    description:
      "See recent re-roof permits in a ZIP to avoid wasting time on already-replaced roofs.",
    status: "coming_soon",
  },
];

export const SUBSCRIPTION_TAGLINE =
  "Everything your Miami-Dade roofing crew needs to find, rank, and reach replacement-ready homeowners.";
