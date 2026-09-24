export default function MenuFormButton({
  action,
  fields,
  label,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  label: string;
  className?: string;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className || "block w-full px-4 py-2 text-left text-sm text-cream/70 hover:bg-white/5"}>
        {label}
      </button>
    </form>
  );
}
