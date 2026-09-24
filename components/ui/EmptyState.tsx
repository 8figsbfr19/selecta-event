export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <p className="font-display text-lg text-cream/80">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-cream/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
