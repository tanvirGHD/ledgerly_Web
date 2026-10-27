import { useEffect, useState } from "react";
import { ArrowRight, PiggyBank, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney, monthKey } from "../lib/format";
import Panel from "../components/Panel";

export default function Budget() {
  const { user } = useAuth();
  const currency = user?.currency || "BDT";
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", limit: "" });
  const month = monthKey();

  async function load() {
    const [bRes, cRes] = await Promise.all([
      api.get("/budgets", { params: { month } }),
      api.get("/categories"),
    ]);
    setBudgets(bRes.data.budgets);
    setCategories(cRes.data.categories.filter((c) => c.type === "expense"));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.limit) return toast.error("Enter a limit");
    try {
      await api.post("/budgets", { month, category: form.category || null, limit: Number(form.limit) });
      toast.success("Budget saved");
      setForm({ category: "", limit: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save budget");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/budgets/${id}`);
    toast.success("Budget removed");
    load();
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper-100">Budget</h1>
        <p className="text-sm text-paper-400">Set limits for {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}.</p>
      </div>

      <Panel title="Set a limit">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
          <label className="block text-sm flex-1 w-full">
            <span className="text-xs text-paper-400 block mb-1">Category (leave blank for overall)</span>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
              <option value="">Overall monthly limit</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label className="block text-sm w-full sm:w-40">
            <span className="text-xs text-paper-400 block mb-1">Limit</span>
            <input type="number" value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))} className="input" />
          </label>
          <button className="flex items-center gap-2 bg-gold-500 text-ink-950 px-4 py-2 rounded text-sm font-medium hover:bg-gold-400 whitespace-nowrap">
            <Plus size={16} /> Save
          </button>
        </form>
      </Panel>

      <Panel title="This month's budgets">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/12 text-gold-400"><PiggyBank size={20} /></div>
            <p className="text-sm font-medium text-paper-100">No budget for this month yet</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-paper-400">Give your spending a clear limit and make the rest of the month easier to read.</p>
            <button onClick={() => document.querySelector("select")?.focus()} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold-500 px-3.5 py-2 text-xs font-medium text-ink-950 hover:bg-gold-400">Set your first budget <ArrowRight size={14} /></button>
          </div>
        ) : (
          <div className="space-y-5">
            {budgets.map((b) => {
              const pct = Math.min(100, (b.spent / b.limit) * 100 || 0);
              const over = b.spent > b.limit;
              return (
                <div key={b._id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <p className="text-paper-100">{b.category || "Overall"}</p>
                    <div className="flex items-center gap-3">
                      <p className="font-tabular text-xs text-paper-400">
                        {formatMoney(b.spent, currency)} / {formatMoney(b.limit, currency)}
                      </p>
                      <button onClick={() => handleDelete(b._id)} className="text-brick-400 hover:text-brick-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded bg-ink-800 overflow-hidden">
                    <div
                      className={`h-full ${over ? "bg-brick-500" : "bg-sage-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="text-xs text-brick-400 mt-1">
                      Over by {formatMoney(b.spent - b.limit, currency)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
