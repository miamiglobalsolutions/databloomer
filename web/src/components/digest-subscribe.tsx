"use client";

import { useState } from "react";

type Props = {
  compact?: boolean;
};

export function DigestSubscribe({ compact }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Subscribe failed");
      setStatus("ok");
      setMessage("You're subscribed to the weekly Bloom Zone digest.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not subscribe",
      );
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-stone-200 bg-white p-4"
          : "rounded-xl border border-orange-200 bg-orange-50 p-6"
      }
    >
      <h2 className="text-sm font-semibold text-stone-900">
        Weekly Bloom Zone digest
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Get the top Miami-Dade ZIPs for canvassing every Monday — ranked by
        DataBloom Score.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourroofingcompany.com"
          className="min-w-[200px] flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
