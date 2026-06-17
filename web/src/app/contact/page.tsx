import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact-form";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

export const metadata: Metadata = {
  title: "Contact DataBloomer",
  description:
    "Questions about Miami-Dade roofing leads, subscriptions, or DataBloomer? Send us a message.",
  alternates: { canonical: `${appUrl}/contact` },
};

export default function ContactPage() {
  return (
    <main className="flex-1">
      <SiteHeader active="contact" />

      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Contact us
        </h1>
        <p className="mt-3 text-stone-600">
          General questions about DataBloomer, pricing, or Miami-Dade lead data.
          For technical issues with your subscription,{" "}
          <Link href="/help" className="font-medium text-orange-700 underline">
            subscriber help
          </Link>{" "}
          is available after you sign in.
        </p>

        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
