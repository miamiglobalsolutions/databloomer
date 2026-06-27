import Link from "next/link";
import { SUBSCRIPTION_BENEFITS } from "@/lib/subscription/benefits";

const TOP_BENEFIT_IDS = [
  "addresses",
  "folios",
  "county-map",
  "databloom-score",
  "email-digest",
  "reddit-requests",
] as const;

/** Short list for the top-of-page benefits strip. */
export const TOP_SUBSCRIPTION_HIGHLIGHTS = TOP_BENEFIT_IDS.map(
  (id) => SUBSCRIPTION_BENEFITS.find((b) => b.id === id)!,
);

export function SubscriptionBenefitsBar() {
  return (
    <div className="border-b border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">
            What you get as a subscriber
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
            {TOP_SUBSCRIPTION_HIGHLIGHTS.map((benefit) => (
              <li key={benefit.id} className="flex items-center gap-1.5">
                <span className="text-orange-600" aria-hidden>
                  ✓
                </span>
                {benefit.title}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/subscribe"
          className="shrink-0 self-start rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 lg:self-center"
        >
          See all subscription benefits
        </Link>
      </div>
    </div>
  );
}
