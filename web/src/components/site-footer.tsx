import Link from "next/link";
import {
  getFeaturedAreas,
  getAreasByRegion,
  MIAMI_AREA_PAGES,
} from "@/lib/miami-dade/areas";
import { AREA_REGION_LABELS, AREA_REGION_ORDER } from "@/lib/miami-dade/area-regions";
import { DataBloomerLogoMark } from "./databloomer-logo-mark";

export function SiteFooter() {
  const featured = getFeaturedAreas();
  const byRegion = getAreasByRegion();

  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <DataBloomerLogoMark />
              <span className="text-lg font-semibold tracking-tight">DataBloomer</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Miami-Dade roofing lead AI Intelligence — aging roofs, Bloom Zones,
              and Neighborhood Bloom forecast for canvassing crews.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Product
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink href="/dashboard?view=map">Bloom Zones map</FooterLink>
              <FooterLink href="/dashboard?type=aging_roof">Aging roof leads</FooterLink>
              <FooterLink href="/subscribe">Subscribe</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/help">Subscriber help</FooterLink>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Featured markets
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {featured.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}`}
                    className="text-stone-600 hover:text-orange-700 hover:underline"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/areas"
              className="mt-3 inline-block text-sm font-medium text-orange-700 hover:underline"
            >
              All {MIAMI_AREA_PAGES.length} markets →
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Browse by region
            </h2>
            <ul className="mt-3 space-y-3 text-sm">
              {AREA_REGION_ORDER.map((region) => (
                <li key={region}>
                  <Link
                    href={`/areas#${region}`}
                    className="font-medium text-stone-700 hover:text-orange-700 hover:underline"
                  >
                    {AREA_REGION_LABELS[region]}
                  </Link>
                  <span className="ml-1 text-stone-400">
                    ({byRegion[region].length})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-stone-100 pt-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} DataBloomer · Miami-Dade County roofing
          lead AI Intelligence · Public county GIS data
        </p>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-stone-600 hover:text-orange-700 hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}
