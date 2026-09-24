"use client";

import { useMemo, useState } from "react";
import { saveQuote } from "@/lib/actions/quotes";
import SubmitButton from "@/components/ui/SubmitButton";
import { centsToDollarsInput } from "@/lib/money";
import { toInputDate } from "@/lib/dates";

type LineItem = { description: string; quantity: number; price: string };

type ClientOption = { id: string; name: string };

export default function QuoteForm({
  quote,
  clients,
  defaultClientId,
  defaultInquiryId,
  defaultEventType,
  defaultEventDate,
}: {
  quote?: {
    id: string;
    clientId: string;
    inquiryId: string | null;
    eventType: string | null;
    eventDate: Date | null;
    discountCents: number;
    taxPercent: number;
    depositCents: number;
    expiresAt: Date | null;
    notes: string;
    lineItems: { description: string; quantity: number; priceCents: number }[];
  };
  clients: ClientOption[];
  defaultClientId?: string;
  defaultInquiryId?: string;
  defaultEventType?: string;
  defaultEventDate?: Date | null;
}) {
  const [items, setItems] = useState<LineItem[]>(
    quote?.lineItems.length
      ? quote.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          price: centsToDollarsInput(li.priceCents),
        }))
      : [{ description: "", quantity: 1, price: "" }]
  );

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 0), 0),
    [items]
  );

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, price: "" }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={saveQuote} className="space-y-6">
      {quote && <input type="hidden" name="id" value={quote.id} />}
      {defaultInquiryId && <input type="hidden" name="inquiryId" value={defaultInquiryId} />}
      <input type="hidden" name="lineItemsJson" value={JSON.stringify(items)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Client</label>
          <select
            name="clientId"
            required
            defaultValue={quote?.clientId || defaultClientId || ""}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          >
            <option value="" className="bg-ink-900">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Type</label>
          <input
            name="eventType"
            defaultValue={quote?.eventType || defaultEventType || ""}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
          <input
            type="date"
            name="eventDate"
            defaultValue={
              quote?.eventDate
                ? toInputDate(quote.eventDate)
                : defaultEventDate
                ? toInputDate(new Date(defaultEventDate))
                : ""
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Expiration Date</label>
          <input
            type="date"
            name="expiresAt"
            defaultValue={quote?.expiresAt ? toInputDate(quote.expiresAt) : ""}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Required Deposit ($)</label>
          <input
            name="deposit"
            type="number"
            step="0.01"
            defaultValue={quote ? centsToDollarsInput(quote.depositCents) : ""}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-cream/50">Line Items</label>
          <button type="button" onClick={addItem} className="text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                className="col-span-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
              />
              <input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value, 10) || 1 })}
                className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(idx, { price: e.target.value })}
                className="col-span-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="col-span-1 rounded-xl border border-red-400/30 text-xs text-red-300 hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Discount ($)</label>
          <input
            name="discount"
            type="number"
            step="0.01"
            defaultValue={quote ? centsToDollarsInput(quote.discountCents) : "0"}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Tax (%)</label>
          <input
            name="taxPercent"
            type="number"
            step="0.01"
            defaultValue={quote?.taxPercent ?? 0}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-col justify-end rounded-xl bg-white/[0.03] px-3 py-2">
          <span className="text-xs uppercase tracking-wider text-cream/40">Subtotal</span>
          <span className="font-display text-lg text-gold-300">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={quote?.notes}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
        />
      </div>

      <SubmitButton pendingText="Saving...">Save Draft</SubmitButton>
    </form>
  );
}
