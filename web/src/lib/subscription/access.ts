/**
 * Subscription gating helpers.
 * API routes enforce masking server-side based on session access level.
 */

export type AccessLevel = "preview" | "subscriber" | "admin";

export function isSubscriptionGatingEnabled(): boolean {
  return (
    process.env.SUBSCRIPTION_GATING === "true" ||
    process.env.NEXT_PUBLIC_SUBSCRIPTION_GATING === "true"
  );
}

export function hasFullAccess(level: AccessLevel): boolean {
  if (!isSubscriptionGatingEnabled()) return true;
  return level === "subscriber" || level === "admin";
}

export function maskAddress(address: string): string {
  const parts = address.trim().split(/\s+/);
  if (parts.length <= 1) return "••• ••••";
  const streetNum = parts[0];
  return `${streetNum.replace(/\d/g, "•")} ${parts.slice(1, 2).join(" ")} •••`;
}

export function maskFolio(folio: string): string {
  if (folio.length <= 4) return "••••";
  return `${folio.slice(0, 2)}•••••${folio.slice(-2)}`;
}

export function displayAddress(address: string): string {
  return address;
}

export function displayFolio(folio: string | null | undefined): string | null {
  if (!folio) return null;
  return folio;
}
