import { join } from "node:path";

export const AGING_ROOF_INDEX_SNAPSHOT_JSON = join(
  process.cwd(),
  "src",
  "data",
  "reports",
  "miami-dade-aging-roofs-hurricane-season-2026.json",
);

export const AGING_ROOF_INDEX_STATIC_PDF_FILENAME =
  "DataBloomer-Miami-Dade-Aging-Roofs-Hurricane-Season-2026.pdf";

export const AGING_ROOF_INDEX_STATIC_PDF_PUBLIC_PATH = `/reports/${AGING_ROOF_INDEX_STATIC_PDF_FILENAME}`;

export const AGING_ROOF_INDEX_STATIC_PDF = join(
  process.cwd(),
  "public",
  "reports",
  AGING_ROOF_INDEX_STATIC_PDF_FILENAME,
);
