import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { HelpPageClient } from "./help-page-client";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

export const metadata: Metadata = {
  title: "Subscriber Help",
  description:
    "Technical support for DataBloomer subscribers — dashboard, map, billing, and sign-in issues.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${appUrl}/help` },
};

export default function HelpPage() {
  return (
    <main className="flex-1">
      <SiteHeader active="help" />

      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Subscriber help
        </h1>
        <p className="mt-3 text-stone-600">
          Technical support for billing, sign-in, dashboard, map, and export
          issues. Available to active subscribers and admins after sign-in.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          For general inquiries, use{" "}
          <Link href="/contact" className="font-medium text-orange-700 underline">
            Contact
          </Link>
          .
        </p>

        <div className="mt-8">
          <HelpPageClient />
        </div>
      </section>
    </main>
  );
}
