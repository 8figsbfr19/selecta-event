import { getSettings } from "@/lib/settings";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import GlowBackground from "@/components/site/GlowBackground";
import FlowerField from "@/components/site/FlowerField";

// The public site reads live settings/services/gallery/events straight from
// the database. Without this, pages with no dynamic params (home, about,
// services, gallery, events list) get frozen as static HTML at build time,
// so admin edits wouldn't show up until the next deploy.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <GlowBackground />
      <FlowerField />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          businessName={settings.businessName}
          logoUrl={settings.logoUrl}
          showEvents={settings.showEvents}
        />
        <main className="flex-1">{children}</main>
        <Footer
          businessName={settings.businessName}
          phone={settings.phone}
          businessEmail={settings.businessEmail}
          instagramUrl={settings.instagramUrl}
          tiktokUrl={settings.tiktokUrl}
          facebookUrl={settings.facebookUrl}
        />
      </div>
    </div>
  );
}
