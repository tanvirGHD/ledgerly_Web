import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "upi", "other"];

export default function TransactionDialog({ open, onClose, onSaved, categories, existing }) {
  const [form, setForm] = useState(blank());

  function blank() {
    return {
      type: "expense",
      amount: "",
      category: categories?.[0]?.name || "",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: "cash",
      notes: "",
      source: "",
    };
  }

  useEffect(() => {
    if (existing) {
      setForm({
        type: existing.type,
        amount: existing.amount,
        category: existing.category,
        date: new Date(existing.date).toISOString().slice(0, 10),
        paymentMethod: existing.paymentMethod,
        notes: existing.notes || "",
        source: existing.source || "",
      });
    } else {
      setForm(blank());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      toast.error("Amount, category and date are required");
      return;
    }
    try {
      if (existing) {
        await api.put(`/transactions/${existing._id}`, form);
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", form);
        toast.success("Transaction added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save transaction");
    }
  }

  const filteredCategories = categories?.filter((c) => c.type === form.type) || [];

  return createPortal(
    (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-4 sm:py-8" role="presentation">
      <div className="modal-panel mx-auto my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-md border border-ink-700/60 bg-ink-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700/60">
          <h3 className="font-display text-lg">{existing ? "Edit transaction" : "Add transaction"}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-paper-400 hover:bg-ink-800 hover:text-paper-100" aria-label="Close transaction dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex rounded border border-ink-700/60 overflow-hidden text-sm">
            {["expense", "income"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t, category: "" }))}
                className={`flex-1 py-2 capitalize ${
                  form.type === t ? "bg-gold-500 text-ink-950" : "text-paper-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            >
              <option value="">Select category</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Payment method">
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              className="input"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace("_", " ")}</option>
              ))}
            </select>
          </Field>

          <Field label="Source (optional)">
            <input
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="input"
              placeholder="e.g. employer, shop name"
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="input resize-none"
              rows={2}
            />
          </Field>

          <button className="w-full bg-gold-500 text-ink-950 rounded py-2 text-sm font-medium hover:bg-gold-400">
            {existing ? "Save changes" : "Add transaction"}
          </button>
        </form>
      </div>
    </div>
    ),
    document.body
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-paper-400 block mb-1">{label}</span>
      {children}
    </label>
  );
}
