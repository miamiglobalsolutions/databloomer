const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

/** Optional CDN override (e.g. Vercel Blob). Defaults to static files in /public. */
export const PROMO_VIDEO_SRC =
  process.env.NEXT_PUBLIC_PROMO_VIDEO_URL ??
  "/videos/databloomer-promo.mp4";

export const PROMO_POSTER_SRC = "/videos/databloomer-promo-poster.jpg";

export const PROMO_PAGE_PATH = "/promo";

export const PROMO_PAGE_URL = `${appUrl}${PROMO_PAGE_PATH}`;
