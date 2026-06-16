"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AccessLevel } from "@/lib/subscription/access";

type AccessState = {
  level: AccessLevel;
  full: boolean;
  email: string | null;
  gatingEnabled: boolean;
};

export function AccessAuthControls({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [access, setAccess] = useState<AccessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const loadAccess = useCallback(async () => {
    try {
      const res = await fetch("/api/access/me", { cache: "no-store" });
      const data = (await res.json()) as AccessState;
      setAccess(data);
    } catch {
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/access/logout", { method: "POST" });
      await loadAccess();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <span className="text-xs text-stone-400">
        {compact ? "…" : "Checking access…"}
      </span>
    );
  }

  if (!access?.gatingEnabled || access.full) {
    const label =
      access?.level === "admin"
        ? "Admin"
        : access?.level === "subscriber"
          ? "Subscriber"
          : null;

    if (!access?.gatingEnabled) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        {label ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
            {label}
            {access.email && !compact ? (
              <span className="text-emerald-700"> · {maskEmail(access.email)}</span>
            ) : null}
          </span>
        ) : null}
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-70"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/subscribe#sign-in"
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Subscriber sign in
      </Link>
      <span className="hidden text-xs text-stone-500 sm:inline">Preview mode</span>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}
