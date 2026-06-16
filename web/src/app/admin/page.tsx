import { SiteHeader } from "@/components/site-header";
import { AccessLoginForm } from "@/components/access-login-form";

export default function AdminPage() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Admin access
        </h1>
        <p className="mt-2 text-stone-600">
          Use your admin code to unlock full access for this browser session.
        </p>
        <div className="mt-6">
          <AccessLoginForm
            target="admin"
            title="Admin login"
            subtitle="Admin sessions can view unmasked addresses and folios."
          />
        </div>
      </section>
    </main>
  );
}
