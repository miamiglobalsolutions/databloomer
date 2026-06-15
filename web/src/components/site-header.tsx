import Link from "next/link";

type Props = {
  active?: "home" | "about" | "subscribe" | "dashboard";
};

export function SiteHeader({ active }: Props) {
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
          <NavLink href="/subscribe" active={active === "subscribe"}>
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
            Open dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-stone-900 text-white"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}
