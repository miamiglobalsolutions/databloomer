"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccessLoginForm } from "@/components/access-login-form";
import { DIGEST_FREQUENCY_OPTIONS } from "@/lib/email/digest-schedule";
import type { DigestFrequency } from "@/lib/email/digest-schedule";

type StripeRow = {
  id: number;
  email: string;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

type DigestRow = {
  id: number;
  email: string;
  subscribed_at: string;
  active: boolean;
  last_sent_at: string | null;
  paid_active: boolean;
};

type DigestSettings = {
  enabled: boolean;
  frequency: DigestFrequency;
  lastRunAt: string | null;
  updatedAt: string;
  nextRunAt: string | null;
};

type Overview = {
  stripeSubscribers: StripeRow[];
  digestSubscribers: DigestRow[];
  digestSettings: DigestSettings;
  stats: {
    stripeCount: number;
    digestCount: number;
    digestActivePaidCount: number;
  };
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function AdminDashboard() {
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const loadOverview = useCallback(async () => {
    setError(null);
    const accessRes = await fetch("/api/access/me", { cache: "no-store" });
    const access = await accessRes.json();
    setAccessLevel(access.level ?? "preview");

    if (access.level !== "admin") {
      setOverview(null);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/overview", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load admin data");
    setOverview(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOverview().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load");
      setLoading(false);
    });
  }, [loadOverview]);

  async function saveSettings(patch: Partial<DigestSettings>) {
    setSavingSettings(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/digest/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      setActionMessage("Digest settings saved.");
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingSettings(false);
    }
  }

  async function sendTestDigest() {
    setSendingTest(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/digest/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test send failed");
      setActionMessage(data.message ?? "Test digest sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test send failed");
    } finally {
      setSendingTest(false);
    }
  }

  async function sendDigestNow() {
    setSendingAll(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/digest/send", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setActionMessage(data.message ?? "Digest sent.");
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSendingAll(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading admin portal…</p>;
  }

  if (accessLevel !== "admin") {
    return (
      <div className="space-y-6">
        {accessLevel === "subscriber" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You&apos;re signed in as a subscriber. Enter your{" "}
            <strong>admin</strong> access code below — it&apos;s different from
            the subscriber code.
          </p>
        ) : null}
        <AccessLoginForm
          target="admin"
          title="Admin login"
          subtitle="Enter your admin access code to manage subscribers and digest settings."
          redirectTo="/admin"
          onSuccess={() => {
            setLoading(true);
            void loadOverview();
          }}
        />
        <p className="text-sm text-stone-500">
          <Link href="/dashboard" className="text-orange-700 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    );
  }

  const settings = overview?.digestSettings;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Admin portal
          </h1>
          <p className="mt-2 text-stone-600">
            Manage monthly subscribers, digest signups, and email schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadOverview()}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Monthly subscribers"
          value={overview?.stats.stripeCount ?? 0}
        />
        <StatCard
          label="Digest signups (active)"
          value={overview?.stats.digestCount ?? 0}
        />
        <StatCard
          label="Digest + paid active"
          value={overview?.stats.digestActivePaidCount ?? 0}
        />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Bloom Zone digest schedule
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Cron checks daily at 14:00 UTC and sends when the selected frequency
          interval has passed. Use test send or send now to verify immediately.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-stone-800">Frequency</span>
            <select
              value={settings?.frequency ?? "weekly"}
              disabled={savingSettings}
              onChange={(e) =>
                saveSettings({ frequency: e.target.value as DigestFrequency })
              }
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            >
              {DIGEST_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-800">
              <input
                type="checkbox"
                checked={settings?.enabled ?? true}
                disabled={savingSettings}
                onChange={(e) => saveSettings({ enabled: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300"
              />
              Automatic digest enabled
            </label>
          </div>
        </div>

        <dl className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-stone-800">Last automatic run</dt>
            <dd>{formatWhen(settings?.lastRunAt ?? null)}</dd>
          </div>
          <div>
            <dt className="font-medium text-stone-800">Next scheduled run</dt>
            <dd>{formatWhen(settings?.nextRunAt ?? null)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-100 pt-6">
          <div className="flex min-w-[240px] flex-1 flex-wrap gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@company.com"
              className="min-w-[200px] flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={sendingTest || !testEmail}
              onClick={sendTestDigest}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {sendingTest ? "Sending…" : "Send test email"}
            </button>
          </div>
          <button
            type="button"
            disabled={sendingAll}
            onClick={sendDigestNow}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {sendingAll ? "Sending…" : "Send digest to all subscribers now"}
          </button>
        </div>
      </section>

      <SubscriberTable
        title="Monthly subscribers (Stripe)"
        description="Paid DataBloomer subscriptions tracked from Stripe webhooks."
        rows={overview?.stripeSubscribers ?? []}
        columns={[
          { key: "email", label: "Email" },
          { key: "status", label: "Status" },
          {
            key: "currentPeriodEnd",
            label: "Period end",
            render: (row) => formatWhen(row.currentPeriodEnd),
          },
          {
            key: "updatedAt",
            label: "Updated",
            render: (row) => formatWhen(row.updatedAt),
          },
        ]}
      />

      <SubscriberTable
        title="Bloom Zone digest subscribers"
        description="Email digest signups — only paid subscribers can enroll."
        rows={overview?.digestSubscribers ?? []}
        columns={[
          { key: "email", label: "Email" },
          {
            key: "active",
            label: "Digest active",
            render: (row) => (row.active ? "Yes" : "No"),
          },
          {
            key: "paid_active",
            label: "Paid active",
            render: (row) => (row.paid_active ? "Yes" : "No"),
          },
          {
            key: "subscribed_at",
            label: "Subscribed",
            render: (row) => formatWhen(row.subscribed_at),
          },
          {
            key: "last_sent_at",
            label: "Last sent",
            render: (row) => formatWhen(row.last_sent_at),
          },
        ]}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function SubscriberTable<T extends Record<string, unknown>>({
  title,
  description,
  rows,
  columns,
}: {
  title: string;
  description: string;
  rows: T[];
  columns: {
    key: keyof T & string;
    label: string;
    render?: (row: T) => string;
  }[];
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-600">{description}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center text-stone-500"
                >
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2 text-stone-800">
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
