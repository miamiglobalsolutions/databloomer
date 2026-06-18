/** Max leads returned per API request (county-wide subscriber views). */
export const LEADS_API_MAX = Number(process.env.LEADS_API_MAX ?? 65_000);

/** Max leads returned when a ZIP filter is active. */
export const LEADS_ZIP_MAX = Number(process.env.LEADS_ZIP_MAX ?? 5_000);

/** Max pins loaded for map view (county-wide). Keeps mobile browsers responsive. */
export const LEADS_MAP_MAX = Number(process.env.LEADS_MAP_MAX ?? 3_000);

/** Max pins loaded for map view when a ZIP filter is active. */
export const LEADS_MAP_ZIP_MAX = Number(process.env.LEADS_MAP_ZIP_MAX ?? 2_000);
