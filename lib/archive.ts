/**
 * Every admin list page supports a `?view=` query param: default (active
 * only), "archived", or "all". This turns that into the Prisma filter to
 * spread into the query's `where`.
 */
export function archivedFilter(view?: string): { archived?: boolean } {
  if (view === "archived") return { archived: true };
  if (view === "all") return {};
  return { archived: false };
}

export const ARCHIVE_VIEWS = [
  { value: undefined, label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
] as const;
