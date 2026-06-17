"use client";

import { useEffect, useState } from "react";

export function HelpForm() {
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/access/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { email?: string | null }) => {
        if (data.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, issueType, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send request.");
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Support request sent. We&apos;ll reply to {email || "your email"} shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Account email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Issue type
        </label>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="login">Sign-in / access</option>
          <option value="billing">Billing / subscription</option>
          <option value="dashboard">Dashboard / leads</option>
          <option value="map">Map view</option>
          <option value="export">CSV export</option>
          <option value="other">Other technical issue</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          What happened?
        </label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Steps to reproduce, error messages, browser, etc."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-70"
      >
        {loading ? "Sending…" : "Submit support request"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
