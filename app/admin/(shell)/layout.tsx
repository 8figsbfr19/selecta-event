import { getSettings } from "@/lib/settings";
import Sidebar from "@/components/admin/Sidebar";

// Admin pages show live business data (bookings, payments, quotes, etc.).
// Several list pages take no params/searchParams, so without this they'd
// get frozen as static HTML at build time and never reflect new records
// until the next deploy. This forces every admin page to render per-request.
export const dynamic = "force-dynamic";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-ink-950 text-cream">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="no-print contents">
          <Sidebar businessName={settings.businessName} logoUrl={settings.logoUrl} />
        </div>
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
