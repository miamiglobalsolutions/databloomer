/** Max leads returned per API request (county-wide subscriber views). */
export const LEADS_API_MAX = Number(process.env.LEADS_API_MAX ?? 65_000);

/** Max leads returned when a ZIP filter is active. */
export const LEADS_ZIP_MAX = Number(process.env.LEADS_ZIP_MAX ?? 5_000);
