export type DigestFrequency = "hourly" | "daily" | "weekly" | "monthly";

export type DigestSettings = {
  enabled: boolean;
  frequency: DigestFrequency;
  lastRunAt: string | null;
  updatedAt: string;
};

export const DIGEST_FREQUENCY_OPTIONS: {
  value: DigestFrequency;
  label: string;
  description: string;
}[] = [
  {
    value: "hourly",
    label: "Hourly (testing)",
    description: "Sends at most once per hour when the daily scheduler runs.",
  },
  {
    value: "daily",
    label: "Daily",
    description: "Sends at most once every 24 hours.",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Sends at most once every 7 days (default).",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Sends at most once every 30 days.",
  },
];

const INTERVAL_MS: Record<DigestFrequency, number> = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

export function isDigestFrequency(value: string): value is DigestFrequency {
  return value in INTERVAL_MS;
}

export function isDigestDue(
  lastRunAt: Date | string | null,
  frequency: DigestFrequency,
): boolean {
  if (!lastRunAt) return true;
  const last = lastRunAt instanceof Date ? lastRunAt : new Date(lastRunAt);
  if (Number.isNaN(last.getTime())) return true;
  return Date.now() - last.getTime() >= INTERVAL_MS[frequency];
}

export function nextDigestRunAt(
  lastRunAt: Date | string | null,
  frequency: DigestFrequency,
): Date | null {
  if (!lastRunAt) return new Date();
  const last = lastRunAt instanceof Date ? lastRunAt : new Date(lastRunAt);
  if (Number.isNaN(last.getTime())) return new Date();
  return new Date(last.getTime() + INTERVAL_MS[frequency]);
}
