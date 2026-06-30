import Link from "next/link";
import { AGING_ROOF_INDEX_STATIC_PDF_PUBLIC_PATH } from "@/lib/reports/aging-roof-index-paths";

export function ReportPdfDownload() {
  return (
    <a
      href={AGING_ROOF_INDEX_STATIC_PDF_PUBLIC_PATH}
      className="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
      download
    >
      Download PDF edition
    </a>
  );
}