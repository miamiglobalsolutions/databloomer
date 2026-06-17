import Link from "next/link";
import { AccessAuthControls } from "@/components/access-auth-controls";
import { SubscriptionBenefitsBar } from "@/components/subscription-benefits-bar";
import { LeadDashboard } from "./lead-dashboard";

type PageProps = {
  searchParams: Promise<{ type?: string; zip?: string; view?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type =
    params.type === "code_violation"
      ? "code_violation"
      : params.type === "new_construction"
        ? "new_construction"
        : "aging_roof";
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
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/about"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Contact
            </Link>
            <Link
              href="/help"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Help
            </Link>
            <Link
              href="/subscribe"
              className="rounded-lg px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
            >
              Subscribe
            </Link>
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
            <TabLink
              href="/dashboard?type=new_construction"
              active={type === "new_construction"}
              label="New builds & additions"
            />
            <AccessAuthControls />
          </nav>
        </div>
        <SubscriptionBenefitsBar />
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {type === "aging_roof" && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-950">
            <strong>Aging roofs are your bread and butter.</strong> Leads in the
            deploy canvassers to the highest-opportunity neighborhoods. Use{" "}
            <strong>Map View</strong> (subscribers) to see color-coded pins by{" "}
            <strong>DataBloom Score</strong>. High confidence = recorded roof
            permit; medium = estimated from year built.
          </div>
        )}

        {type === "code_violation" && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-stone-100 px-5 py-4 text-sm text-stone-800">
            <strong>Open code enforcement cases.</strong> Miami-Dade does not tag
            violations as &ldquo;roof&rdquo; in its public GIS — roof problems usually
            appear as structure or minimum-housing maintenance cases. These are active
            (&ldquo;Open&rdquo;) enforcement leads worth a door knock or call.
          </div>
        )}

        {type === "new_construction" && (
          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-950">
            <strong>Fresh builder activity.</strong> These permits show recent
            new construction and additions (APPTYPE 07/01/02) so your team can
            target active builders and neighborhoods with current project volume.
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
