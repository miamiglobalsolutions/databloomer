import PDFDocument from "pdfkit";
import { MOMENTUM_LABEL_COPY } from "@/lib/leads/neighborhood-bloom";
import { ROOF_JOB_VALUE_DISCLAIMER } from "@/lib/leads/roof-job-value";
import {
  PUBLIC_REPORT_PRIVACY_NOTICE,
  type AgingRoofIndexReport,
  formatCurrency,
  formatNumber,
} from "@/lib/reports/aging-roof-index";

type PdfDoc = InstanceType<typeof PDFDocument>;

const BRAND_ORANGE = "#ea580c";
const INK = "#1c1917";
const MUTED = "#57534e";

function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function paragraph(doc: PdfDoc, text: string, opts?: { gap?: number }) {
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, { lineGap: 3 });
  doc.moveDown(opts?.gap ?? 0.8);
}

function sectionTitle(doc: PdfDoc, text: string) {
  doc.moveDown(0.4);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(13).text(text);
  doc.moveDown(0.35);
}

function ensureSpace(doc: PdfDoc, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

export function buildAgingRoofIndexPdf(report: AgingRoofIndexReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
      info: {
        Title: "Miami-Dade Aging Roof Index 2026",
        Author: "DataBloomer",
        Subject: "ZIP-level aging roof replacement activity — Miami-Dade County",
        Keywords: "Miami, roofing, aging roof, ZIP code, DataBloomer",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const asOf = formatReportDate(report.generatedAt);
    const { countyTotals, top10, oldestByAvgAge, highestEstimatedValue } = report;

    doc.fillColor(BRAND_ORANGE).font("Helvetica-Bold").fontSize(9).text("DATABLOOMER RESEARCH");
    doc.moveDown(0.3);
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(17)
      .text("Miami-Dade Aging Roof Index 2026", { lineGap: 2 });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(MUTED)
      .text("Top ZIP codes for replacement activity ahead of hurricane season");
    doc.moveDown(0.6);
    doc.fontSize(9).text(`Data as of ${asOf}  ·  Roofs over ${report.minRoofAgeYears} years only`);
    doc.moveDown(0.4);
    doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(8.5).text(PUBLIC_REPORT_PRIVACY_NOTICE);
    doc.moveDown(1);

    sectionTitle(doc, "Executive summary");
    paragraph(
      doc,
      `This index covers ${formatNumber(countyTotals.totalAgingLeads)} well-aged Miami-Dade properties (roof age strictly over ${report.minRoofAgeYears} years). ${formatNumber(countyTotals.replacementLikely)} score 80+ on the DataBloom Score (replacement likely). County average roof age: ${countyTotals.avgRoofAgeYears} years across ${countyTotals.zipsAnalyzed} ZIP codes with at least 10 qualifying homes.${
        countyTotals.medianEstimatedJobValue != null
          ? ` Median estimated re-roof size by ZIP: ${formatCurrency(countyTotals.medianEstimatedJobValue)} (heated area × $${report.jobValueRatePerSqft}/sq ft).`
          : ""
      }`,
    );

    if (top10.length > 0) {
      paragraph(
        doc,
        `#1 ranked ZIP: ${top10[0].zip} (${top10[0].areaLabel}) — bloom score ${top10[0].neighborhoodScore}, ${formatNumber(top10[0].replacementLikelyCount)} replacement-likely homes, ${top10[0].avgRoofAgeYears} yr average roof age.`,
      );
    }

    sectionTitle(doc, "Top 10 ZIP codes");
    ensureSpace(doc, 220);

    const cols = [36, 88, 148, 208, 268, 328, 400, 468];
    const headers = ["#", "ZIP", "Bloom", "Repl.", "Age", "Est.job", "Momentum", "Permits"];
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
    let headerY = doc.y;
    headers.forEach((h, i) => doc.text(h, cols[i], headerY, { width: 70, lineBreak: false }));
    doc.moveDown(1.1);

    doc.font("Helvetica").fontSize(8.5).fillColor(INK);
    for (const row of top10) {
      ensureSpace(doc, 28);
      const y = doc.y;
      const momentum = MOMENTUM_LABEL_COPY[row.momentumLabel].title;
      doc.text(String(row.rank), cols[0], y, { width: 24, lineBreak: false });
      doc.text(row.zip, cols[1], y, { width: 52, lineBreak: false });
      doc.text(String(row.neighborhoodScore), cols[2], y, { width: 52, lineBreak: false });
      doc.text(formatNumber(row.replacementLikelyCount), cols[3], y, { width: 52, lineBreak: false });
      doc.text(`${row.avgRoofAgeYears}y`, cols[4], y, { width: 52, lineBreak: false });
      doc.text(formatCurrency(row.avgEstimatedJobValue), cols[5], y, { width: 64, lineBreak: false });
      doc.text(momentum, cols[6], y, { width: 64, lineBreak: false });
      doc.text(String(row.permits12mo), cols[7], y, { width: 40, lineBreak: false });
      doc
        .fillColor(MUTED)
        .fontSize(7.5)
        .text(row.areaLabel, cols[1], y + 11, { width: 200, lineBreak: false });
      doc.fillColor(INK).fontSize(8.5);
      doc.y = y + 24;
    }

    doc.moveDown(0.6);
    sectionTitle(doc, "Oldest average roof age by ZIP");
    for (const row of oldestByAvgAge) {
      paragraph(doc, `${row.zip} (${row.areaLabel}) — ${row.avgRoofAgeYears} years average`, { gap: 0.35 });
    }

    sectionTitle(doc, "Highest estimated replacement cost by ZIP");
    for (const row of highestEstimatedValue) {
      paragraph(
        doc,
        `${row.zip} (${row.areaLabel}) — ${formatCurrency(row.avgEstimatedJobValue)} average est. job`,
        { gap: 0.35 },
      );
    }

    sectionTitle(doc, "Methodology");
    paragraph(
      doc,
      `Produced by DataBloomer (databloomer.com) from Miami-Dade building permits and property appraiser records. Public edition: ZIP-level aggregates only; roofs over ${report.minRoofAgeYears} years; DataBloom Score 0–100; neighborhood bloom forecast from permit momentum and aging inventory. ${ROOF_JOB_VALUE_DISCLAIMER}`,
      { gap: 0.5 },
    );

    paragraph(
      doc,
      `Full interactive report: databloomer.com/reports/miami-dade-aging-roof-index-2026 · Media: databloomer.com/contact`,
    );

    doc.end();
  });
}
