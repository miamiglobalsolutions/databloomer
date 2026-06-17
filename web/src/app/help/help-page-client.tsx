"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpForm } from "@/components/help-form";

type AccessState = {
  full: boolean;
  level: string;
  gatingEnabled: boolean;
};

export function HelpPageClient() {
  const [access, setAccess] = useState<AccessState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/access/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: AccessState) => setAccess(data))
      .catch(() => setAccess(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-stone-500">Checking subscriber access…</p>;
  }

  const canUseHelp = !access?.gatingEnabled || access.full;

  if (!canUseHelp) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-sm text-orange-950">
        <p className="font-medium">Subscriber help is for paid accounts</p>
        <p className="mt-2">
          Sign in with the email you used at checkout to submit technical support
          requests.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/subscribe#sign-in"
            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
          >
            Sign-in
          </Link>
          <Link
            href="/subscribe"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-800 hover:bg-stone-50"
          >
            Subscribe
          </Link>
        </div>
        <p className="mt-4 text-stone-700">
          General questions? Use the{" "}
          <Link href="/contact" className="font-medium underline">
            contact form
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <HelpForm />
    </div>
  );
}
