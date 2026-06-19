"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  compact?: boolean;
};

export function DigestSubscribe({ compact }: Props) {
  const [email, setEmail] = useState("");
  const [eligible, setEligible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/subscribe", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { eligible?: boolean; subscribed?: boolean; email?: string }) => {
        setEligible(Boolean(data.eligible));
        setSubscribed(Boolean(data.subscribed));
        if (data.email) setEmail(data.email);
      })
      .catch(() => setEligible(false))
      .finally(() => setAccessChecked(true));
  }, []);

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
      setSubscribed(true);
      setMessage("You're subscribed to the Bloom Zone email digest.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not subscribe",
      );
    }
  }

  async function handleUnsubscribe() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unsubscribe failed");
      setStatus("ok");
      setSubscribed(false);
      setMessage("Digest emails turned off for this address.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not unsubscribe",
      );
    }
  }

  if (!accessChecked) {
    return (
      <div
        className={
          compact
            ? "rounded-xl border border-stone-200 bg-white p-4"
            : "rounded-xl border border-orange-200 bg-orange-50 p-6"
        }
      >
        <p className="text-sm text-stone-500">Checking digest access…</p>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div
        className={
          compact
            ? "rounded-xl border border-stone-200 bg-white p-4"
            : "rounded-xl border border-orange-200 bg-orange-50 p-6"
        }
      >
        <h2 className="text-sm font-semibold text-stone-900">
          Bloom Zone email digest
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Paid subscribers receive a recurring email with refreshed lead counts
          and top Bloom ZIPs.
        </p>
        <p className="mt-3 text-sm text-orange-800">
          Subscribers only.{" "}
          <Link href="/subscribe" className="font-medium underline">
            Subscribe
          </Link>{" "}
          or{" "}
          <Link href="/subscribe#sign-in" className="font-medium underline">
            sign in
          </Link>{" "}
          to enable digest emails.
        </p>
      </div>
    );
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
        Bloom Zone email digest
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Get top Miami-Dade ZIPs for canvassing — ranked by DataBloom Score.
        Subscriber benefit only.
      </p>

      {subscribed ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-emerald-800">
            Digest active for <strong>{email}</strong>.
          </p>
          <button
            type="button"
            disabled={status === "loading"}
            onClick={handleUnsubscribe}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-60"
          >
            {status === "loading" ? "Updating…" : "Turn off digest emails"}
          </button>
        </div>
      ) : (
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
            {status === "loading" ? "Subscribing…" : "Enable digest emails"}
          </button>
        </form>
      )}

      {message ? (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
