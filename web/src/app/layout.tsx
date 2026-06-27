import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import {
  CONTRACTOR_SEO_KEYWORDS,
  HOME_PAGE_DESCRIPTION,
  APP_URL,
} from "@/lib/site/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Miami Roofing Leads for Contractors — DataBloomer",
    template: "%s | DataBloomer",
  },
  description: HOME_PAGE_DESCRIPTION,
  keywords: [...CONTRACTOR_SEO_KEYWORDS],
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
    title: "Miami Roofing Leads for Contractors — DataBloomer",
    description: HOME_PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Miami Roofing Leads for Contractors — DataBloomer",
    description: HOME_PAGE_DESCRIPTION,
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
        <SiteFooter />
      </body>
    </html>
  );
}
