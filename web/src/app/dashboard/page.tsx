import Link from "next/link";
import { LeadDashboard } from "./lead-dashboard";

type PageProps = {
  searchParams: Promise<{ type?: string; zip?: string; view?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type === "code_violation" ? "code_violation" : "aging_roof";
  const zip = params.zip ?? "";
  const initialView = params.view === "map" ? "map" : "list";

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
                DB
              </span>
              <span className="font-semibold">DataBloomer</span>
            </Link>
            <span className="hidden text-stone-400 sm:inline">/</span>
            <span className="text-sm text-stone-600">Lead dashboard</span>
          </div>
          <nav className="flex gap-2">
            <TabLink
              href="/dashboard?type=aging_roof"
              active={type === "aging_roof"}
              label="Aging roofs"
              highlight
            />
            <TabLink
              href="/dashboard?type=code_violation"
              active={type === "code_violation"}
              label="Violations"
            />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {type === "aging_roof" && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-950">
            <strong>Aging roofs are your bread and butter.</strong> Leads are ranked
            by roof age (targeting 13–17 years), home value, and permit confidence.
            Add <code className="rounded bg-orange-100 px-1">SHOVELS_API_KEY</code> for
            historical permit accuracy beyond the county&apos;s 3-year GIS window.
          </div>
        )}

        <LeadDashboard type={type} initialZip={zip} initialView={initialView} />
      </div>
    </main>
  );
}

function TabLink({
  href,
  active,
  label,
  highlight,
}: {
  href: string;
  active: boolean;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? highlight
            ? "bg-orange-600 text-white"
            : "bg-stone-900 text-white"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
    >
      {label}
    </Link>
  );
}
