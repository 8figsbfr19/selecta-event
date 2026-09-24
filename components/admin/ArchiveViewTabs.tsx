import Link from "next/link";

export default function ArchiveViewTabs({
  basePath,
  view,
  extraQuery,
}: {
  basePath: string;
  view?: string;
  extraQuery?: Record<string, string | undefined>;
}) {
  const views: { value: string | undefined; label: string }[] = [
    { value: undefined, label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="flex gap-2">
      {views.map((v) => {
        const isActive = (view || undefined) === v.value;
        const params = new URLSearchParams();
        if (extraQuery) {
          Object.entries(extraQuery).forEach(([k, val]) => {
            if (val) params.set(k, val);
          });
        }
        if (v.value) params.set("view", v.value);
        const qs = params.toString();
        const href = `${basePath}${qs ? `?${qs}` : ""}`;
        return (
          <Link
            key={v.label}
            href={href}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
              isActive ? "border-gold-400/50 bg-gold-400/10 text-gold-300" : "border-white/10 text-cream/50 hover:text-cream"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
