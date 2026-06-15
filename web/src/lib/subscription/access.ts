/**
 * Subscription gating — off by default until billing is live.
 * Set NEXT_PUBLIC_SUBSCRIPTION_GATING=true to blur addresses/folios for preview users.
 * Set NEXT_PUBLIC_PREVIEW_AS_SUBSCRIBER=true to test the full subscriber experience.
 */

export function isSubscriptionGatingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SUBSCRIPTION_GATING === "true";
}

export function hasFullSubscriberAccess(): boolean {
  if (!isSubscriptionGatingEnabled()) return true;
  return process.env.NEXT_PUBLIC_PREVIEW_AS_SUBSCRIBER === "true";
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
  return hasFullSubscriberAccess() ? address : maskAddress(address);
}

export function displayFolio(folio: string | null | undefined): string | null {
  if (!folio) return null;
  return hasFullSubscriberAccess() ? folio : maskFolio(folio);
}
