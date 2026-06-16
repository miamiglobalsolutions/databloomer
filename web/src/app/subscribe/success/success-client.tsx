"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export default function SubscribeSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your subscription...");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing checkout session. Please contact support.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Verification failed.");
        }
        if (!cancelled) {
          setStatus("ok");
          setMessage("Subscription active. Redirecting to your dashboard...");
          router.replace("/dashboard?view=map");
          router.refresh();
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err instanceof Error
              ? err.message
              : "Could not verify subscription.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <main className="flex-1">
      <SiteHeader active="subscribe" showBenefitsBar={false} />
      <section className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-stone-900">Subscription status</h1>
        <p
          className={`mt-4 text-sm ${
            status === "error" ? "text-red-600" : "text-stone-600"
          }`}
        >
          {message}
        </p>
        {status === "error" ? (
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/subscribe"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium"
            >
              Back to subscribe
            </Link>
            <Link
              href="/dashboard?view=map"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white"
            >
              Open dashboard
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
