import Link from "next/link";

export default function ContactThankYouPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-24 text-center sm:px-8">
      <div className="glass-card max-w-lg rounded-3xl p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Message Sent</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-cream sm:text-4xl">Thank You!</h1>
        <p className="mt-4 text-sm text-cream/70 sm:text-base">
          We&apos;ve received your message and will respond as soon as possible.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-gold"
        >
          Back To Home
        </Link>
      </div>
    </div>
  );
}
