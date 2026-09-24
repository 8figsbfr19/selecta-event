"use client";

import { renameTag, deleteTag } from "@/lib/actions/gallery";
import ConfirmSubmit from "@/components/ui/ConfirmSubmit";

export default function InlineTagChip({ id, name }: { id: string; name: string }) {
  return (
    <div className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1 text-xs text-cream/70">
      <form
        action={renameTag}
        onSubmit={(e) => {
          const input = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
          if (!input.value.trim() || input.value === name) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <input
          name="name"
          defaultValue={name}
          onBlur={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-auto max-w-[8rem] bg-transparent focus:outline-none"
        />
      </form>
      <form action={deleteTag}>
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmit message={`Delete tag "${name}"?`} className="ml-1 rounded-full px-1.5 text-red-300/70 hover:bg-red-500/10 hover:text-red-300">
          ✕
        </ConfirmSubmit>
      </form>
    </div>
  );
}
