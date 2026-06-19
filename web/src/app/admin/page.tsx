import { SiteHeader } from "@/components/site-header";
import { AdminDashboard } from "./admin-dashboard";

export default function AdminPage() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <AdminDashboard />
      </section>
    </main>
  );
}
