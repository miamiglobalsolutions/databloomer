import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "DataBloomer — Miami-Dade Roofing Leads & Bloom Zones",
    template: "%s | DataBloomer",
  },
  description:
    "Miami-Dade roofing lead intelligence for contractors. Aging roof leads, Bloom Zones color-coded maps, DataBloom Score, and code enforcement opportunities.",
  keywords: [
    "Miami roofing leads",
    "Miami-Dade roof replacement",
    "roofing contractor leads Florida",
    "aging roof leads",
    "Bloom Zones",
    "DataBloom Score",
    "roof canvassing Miami",
  ],
  applicationName: "DataBloomer",
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "DataBloomer",
    title: "DataBloomer — Miami-Dade Roofing Leads",
    description:
      "Find aging roof leads and Bloom Zones maps across Miami-Dade County.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DataBloomer — Miami Roofing Leads",
    description:
      "Bloom Zones maps and DataBloom Score for Miami-Dade roofing contractors.",
  },
  alternates: {
    canonical: appUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
