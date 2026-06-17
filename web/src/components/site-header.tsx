import Link from "next/link";
import { AccessAuthControls } from "./access-auth-controls";
import { SubscriptionBenefitsBar } from "./subscription-benefits-bar";

type Props = {
  active?: "home" | "about" | "subscribe" | "dashboard" | "contact" | "help";
  showBenefitsBar?: boolean;
};

export function SiteHeader({ active, showBenefitsBar = active !== "subscribe" }: Props) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
            DB
          </span>
          <span className="text-lg font-semibold tracking-tight">DataBloomer</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink href="/about" active={active === "about"}>
            About
          </NavLink>
          <NavLink href="/contact" active={active === "contact"}>
            Contact
          </NavLink>
          <NavLink href="/help" active={active === "help"}>
            Help
          </NavLink>
          <NavLink href="/subscribe" active={active === "subscribe"} highlight>
            Subscribe
          </NavLink>
          <Link
            href="/dashboard?view=map"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              active === "dashboard"
                ? "bg-orange-600 text-white"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            Dashboard
          </Link>
          <AccessAuthControls compact />
        </nav>
      </div>
      {showBenefitsBar && <SubscriptionBenefitsBar />}
    </header>
  );
}

function NavLink({
  href,
  active,
  highlight,
  children,
}: {
  href: string;
  active?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? highlight
            ? "bg-orange-600 text-white"
            : "bg-stone-900 text-white"
          : highlight
            ? "text-orange-700 hover:bg-orange-50"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}
