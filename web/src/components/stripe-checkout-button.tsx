"use client";

import { useState } from "react";

async function readJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      `Checkout failed (${res.status}). Server returned an empty response — check Vercel env vars and redeploy.`,
    );
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Checkout failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await readJsonResponse(res);
      if (!res.ok) {
        const hint =
          typeof data.hint === "string" ? ` ${data.hint}` : "";
        throw new Error(
          `${String(data.error ?? "Could not start checkout.")}${hint}`,
        );
      }
      if (typeof data.url !== "string" || !data.url) {
        throw new Error("Stripe checkout URL missing.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700 disabled:opacity-70"
      >
        {loading ? "Redirecting to Stripe..." : "Subscribe now"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
