import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { loginAction } from "@/lib/actions/auth";
import SubmitButton from "@/components/ui/SubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-5">
      <div className="glass-card w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center">
          <span className="relative mb-4 block h-16 w-16 overflow-hidden rounded-full shadow-gold ring-1 ring-gold-400/40">
            <Image src={settings.logoUrl} alt={settings.businessName} fill className="object-cover" />
          </span>
          <h1 className="font-display text-xl font-semibold text-cream">{settings.businessName}</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold-300/70">Admin Login</p>
        </div>

        {searchParams.error && (
          <p className="mt-6 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
            Invalid email or password.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={searchParams.next || "/admin"} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
            />
          </div>
          <SubmitButton pendingText="Signing in..." className="w-full rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-gold">
            Sign In
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
